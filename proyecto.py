import time
import serial
from pynput.keyboard import Controller, Key
# pip install pyserial pynput

# --- CONFIGURA TU PUERTO COM ---
PORT = 'COM3'   # Cambia si es necesario
BAUD = 9600

# Mantener izquierda/derecha si no llega otro pulso
HOLD_TIMEOUT = 0.15     # segundos
# Salto corto (no “salto largo”)
JUMP_HOLD = 0.12        # segundos (120 ms)
# Anti-doble salto desde el joystick (debounce)
JUMP_DEBOUNCE = 1.5    # segundos (250 ms)

kbd = Controller()
pressed = {"left": False, "right": False}
last_seen = {"left": 0.0, "right": 0.0}
last_jump_time = 0.0
announced = False

def press_if_needed(name, key):
    if not pressed[name]:
        kbd.press(key)
        pressed[name] = True

def release_if_needed(name, key):
    if pressed[name]:
        kbd.release(key)
        pressed[name] = False

# Intentar conectar al Arduino
try:
    arduino = serial.Serial(PORT, BAUD, timeout=0.05)
    print(f"✅ Joystick conectado en {PORT}")
except serial.SerialException:
    print(f"❌ No se pudo conectar con el joystick en {PORT}")
    raise SystemExit

print("Esperando señales del joystick...")

try:
    while True:
        if arduino.in_waiting > 0:
            cmd = arduino.readline().decode(errors='ignore').strip()

            if cmd and not announced:
                # Aviso a tu juego (Muestra “Joystick conectado” si capturas F12)
                kbd.press(Key.f12)
                kbd.release(Key.f12)
                print("🎮 Señal recibida del joystick, control activo.")
                announced = True

            if cmd == "IZQUIERDA":
                last_seen["left"] = time.time()
                release_if_needed("right", Key.right)
                press_if_needed("left", Key.left)

            elif cmd == "DERECHA":
                last_seen["right"] = time.time()
                release_if_needed("left", Key.left)
                press_if_needed("right", Key.right)

            elif cmd == "C":
                now = time.time()
                # Debounce: ignora saltos seguidos muy pegados
                if now - last_jump_time >= JUMP_DEBOUNCE:
                    last_jump_time = now
                    kbd.press(Key.up)
                    time.sleep(JUMP_HOLD)  # salto corto (no largo)
                    kbd.release(Key.up)

        # Soltar izquierda/derecha si no llegan pulsos recientes
        now = time.time()
        if pressed["left"] and (now - last_seen["left"] > HOLD_TIMEOUT):
            release_if_needed("left", Key.left)
        if pressed["right"] and (now - last_seen["right"] > HOLD_TIMEOUT):
            release_if_needed("right", Key.right)

        time.sleep(0.01)

except KeyboardInterrupt:
    pass
finally:
    release_if_needed("left", Key.left)
    release_if_needed("right", Key.right)
    try:
        arduino.close()
    except Exception:
        pass