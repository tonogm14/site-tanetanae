import React from 'react';

const Icon = ({ name, size = 18, stroke = 1.6 }) => {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const paths = {
    search:          (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
    menu:            (<><path d="M3 6h18M3 12h18M3 18h18" /></>),
    close:           (<><path d="M5 5l14 14M19 5L5 19" /></>),
    arrow:           (<><path d="M5 12h14M13 6l6 6-6 6" /></>),
    arrow_up_right:  (<><path d="M7 17 17 7M9 7h8v8" /></>),
    chevron_r:       (<><path d="m9 6 6 6-6 6" /></>),
    chevron_l:       (<><path d="m15 6-6 6 6 6" /></>),
    play:            (<><path d="M7 5v14l12-7z" /></>),
    clock:           (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
    eye:             (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>),
    bookmark:        (<><path d="M6 4h12v17l-6-4-6 4z" /></>),
    share:           (<><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>),
    whatsapp:        (<><path d="M3 21l1.6-4.7A8 8 0 1 1 8 19.4Z" /><path d="M9 9.5c.3 1.5 1.5 3.2 3 4.5 1 .8 2 1.2 2.6.7l.7-.7c.3-.3.3-.5 0-.8L13.7 12c-.3-.3-.5-.3-.8 0l-.3.3c-.2.2-.4.1-.6 0-.7-.5-1.3-1.1-1.7-1.8-.1-.2-.1-.4 0-.5l.3-.4c.3-.3.3-.5 0-.8L9 7.5c-.3-.3-.5-.3-.8 0l-.7.7c-.4.4-.4 1.1 0 1.8Z" /></>),
    facebook:        (<><path d="M14 7h3V3h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V7Z" /></>),
    twitter:         (<><path d="M4 4l7.5 9.5L4.5 20H7l5.7-5.5L17 20h3L12 10l6.5-6h-2.7l-5 4.8L7 4Z" /></>),
    instagram:       (<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></>),
    tiktok:          (<><path d="M9 3h2v2a3 3 0 0 0 3 3h2v2h-2a5 5 0 0 1-3-1v5a4 4 0 1 1-4-4V12a2 2 0 1 0 2 2V3Z" fill="currentColor" stroke="none" /></>),
    link:            (<><path d="M10 14a4 4 0 0 0 5.66 0l2-2a4 4 0 0 0-5.65-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-2 2a4 4 0 0 0 5.65 5.66l1-1" /></>),
    youtube:         (<><rect x="2.5" y="6" width="19" height="12" rx="3" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>),
    location:        (<><path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></>),
    flame:           (<><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-3 2-7 1 2 3 2 3-3Z" /></>),
    radio:           (<><circle cx="12" cy="12" r="2" /><path d="M8 8a5.7 5.7 0 0 0 0 8M16 8a5.7 5.7 0 0 1 0 8M5 5a10 10 0 0 0 0 14M19 5a10 10 0 0 1 0 14" /></>),
    moon:            (<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>),
    sun:             (<><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>),
  };

  return <svg {...p}>{paths[name] || null}</svg>;
};

export default Icon;
