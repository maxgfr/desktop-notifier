export type Notif = {
  id: string;
  urlToFetch: string;
  responseSaved?: any;
  responseSavedHtml?: string;
  iteration: number;
  type: 'json' | 'html';
};
