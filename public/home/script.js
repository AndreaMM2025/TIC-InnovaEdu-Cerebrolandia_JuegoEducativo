document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".contenido");
  sections.forEach(sec => sec.classList.remove("visible"));

  items.forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.dataset.target;
      const targetSection = document.getElementById(targetId);

      const isVisible = targetSection.classList.contains("visible");

      sections.forEach(sec => sec.classList.remove("visible"));
      items.forEach(i => i.classList.remove("active"));

      if (!isVisible) {
        targetSection.classList.add("visible");
        item.classList.add("active");
      }
    });
  });
});


