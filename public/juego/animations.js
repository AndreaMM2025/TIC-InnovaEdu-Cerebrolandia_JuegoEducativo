export const createAnimations = (game) => {
  game.anims.create({
    key: 'mario-walk',
    frames: game.anims.generateFrameNumbers(
      'mario',
      { start: 1, end: 3 }
    ),
    frameRate: 12,
    repeat: -1
  })

  game.anims.create({
    key: 'mario-idle',
    frames: [{ key: 'mario', frame: 0 }]
  })

  game.anims.create({
    key: 'mario-jump',
    frames: [{ key: 'mario', frame: 5 }]
  })

  game.anims.create({
    key: 'mario-dead',
    frames: [{ key: 'mario', frame: 4 }]
  })

  game.anims.create({
    key: 'goomba-walk',
    frames: game.anims.generateFrameNumbers('goomba', { start: 0, end: 1 }),
    frameRate: 5,
  });

  

  game.anims.create({
    key: 'koopa-walk',
    frames: game.anims.generateFrameNumbers('koopa', { start: 0, end: 1 }),
    frameRate: 5,
  });

  game.anims.create({
    key: 'mistery-anim',
    frames: game.anims.generateFrameNumbers('mistery', { start: 0, end: 2 }),
    frameRate: 4,
    repeat: -1
  });
};
