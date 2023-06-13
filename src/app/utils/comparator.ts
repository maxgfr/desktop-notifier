import { Notif } from 'app/types';

const comparator = (responseData: any, notif?: Notif): boolean => {
  if (!notif) {
    return false;
  }
  if (notif.iteration === 0) {
    return false;
  }
  if (notif.responseSaved === responseData) {
    return true;
  }
  return false;
};

export default comparator;
