export const generateGameConfig = async (prompt) => {
  console.log('Generating game config for:', prompt);
  
  // Determine game type from prompt
  let gameType = "racing";
  if (prompt.toLowerCase().includes('pong')) gameType = "pong";
  if (prompt.toLowerCase().includes('snake')) gameType = "snake";
  if (prompt.toLowerCase().includes('flappy')) gameType = "flappy";
  
  const configs = {
    racing: { title: "Racing Game", type: "racing", maxPlayers: 2 },
    pong: { title: "Pong Game", type: "pong", maxPlayers: 2 },
    snake: { title: "Snake Game", type: "snake", maxPlayers: 1 },
    flappy: { title: "Flappy Game", type: "flappy", maxPlayers: 1 }
  };
  
  const config = {
    ...configs[gameType],
    objects: [],
    settings: {
      gravity: 9.8,
      lighting: "dynamic",
      environment: "city"
    }
  };
  
  console.log('Generated config:', config);
  return config;
};