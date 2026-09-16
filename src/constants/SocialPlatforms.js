export const SocialPlatforms = {
  platforms: {
    'GitHub': {
      name: 'GitHub',
      color: '181717',
      logo: 'github',
      urlBuilder: (username) => `https://github.com/${username}`,
    },
    'TikTok': {
      name: 'TikTok',
      color: '000000',
      logo: 'tiktok',
      urlBuilder: (username) => `https://www.tiktok.com/@${username}`,
    },
    'Threads': {
      name: 'Threads',
      color: '000000',
      logo: 'threads',
      urlBuilder: (username) => `https://www.threads.net/@${username}`,
    },
    'Discord': {
      name: 'Discord',
      color: '5865F2',
      logo: 'discord',
      urlBuilder: (username) => `https://discord.gg/${username}`,
    },
    'YouTube': {
      name: 'YouTube',
      color: 'FF0000',
      logo: 'youtube',
      urlBuilder: (username) => `https://youtube.com/@${username}`,
    },
    'Facebook': {
      name: 'Facebook',
      color: '1877F2',
      logo: 'facebook',
      urlBuilder: (username) => `https://facebook.com/${username}`,
    },
    'Buy Me A Coffee': {
      name: 'Buy Me A Coffee',
      color: 'FFDD00',
      logo: 'buymeacoffee',
      urlBuilder: (username) => `https://www.buymeacoffee.com/${username}`,
    },
    'Instagram': {
      name: 'Instagram',
      color: 'E4405F',
      logo: 'instagram',
      urlBuilder: (username) => `https://instagram.com/${username}`,
    },
    'LinkedIn': {
      name: 'LinkedIn',
      color: '0A66C2',
      logo: 'linkedin',
      urlBuilder: (username) => `https://linkedin.com/in/${username}`,
    },
    'Telegram': {
      name: 'Telegram',
      color: '26A5E4',
      logo: 'telegram',
      urlBuilder: (username) => `https://t.me/${username}`,
    },
    'WhatsApp': {
      name: 'WhatsApp',
      color: '25D366',
      logo: 'whatsapp',
      urlBuilder: (username) => `https://wa.me/${username}`,
    },
    'X (Twitter)': {
      name: 'X',
      color: '000000',
      logo: 'x',
      urlBuilder: (username) => `https://x.com/${username}`,
    },
    'Medium': {
      name: 'Medium',
      color: '000000',
      logo: 'medium',
      urlBuilder: (username) => `https://medium.com/@${username}`,
    },
  },

  getBadgeUrl: (platform, style = 'flat') => {
    const p = SocialPlatforms.platforms[platform];
    if (!p) return `https://img.shields.io/badge/${platform}-grey`;
    const message = encodeURIComponent(p.name);
    const logo = encodeURIComponent(p.logo);
    return `https://img.shields.io/static/v1?label=&message=${message}&color=${p.color}&logo=${logo}&logoColor=white&style=${style}`;
  },

  getTargetUrl: (platform, username) => {
    const p = SocialPlatforms.platforms[platform];
    return p ? p.urlBuilder(username) : '';
  }
};
