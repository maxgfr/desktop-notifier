import axios from 'axios';
import { useEffect } from 'react';

const URL_TO_FETCH = [
  'https://pro.alaxione.fr/ajax/rdv_disponible_ajax.php?cookie=lhs2nsnx&idc=83awarpmtabwlbhxd&provenance=web&lang=fr&idprofession=4&idp=571ED6642022Z09Z19X17C40C551B5DA1DC662A5CE&idtyperdv=14274&idlieux=2304&nbpersonne=1&filtreall=',
  'https://pro.alaxione.fr/ajax/rdv_disponible_ajax.php?cookie=lhs2jsu7&idc=83awarpmtabwlbhxd&provenance=web&lang=fr&idprofession=4&idp=585E963F2022Z09Z07X12C01C3229411187092F43D&idtyperdv=14274&idlieux=2304&nbpersonne=1&filtreall=',
  'https://pro.alaxione.fr/ajax/rdv_disponible_ajax.php?cookie=lhs2i880&idc=83awarpmtabwlbhxd&provenance=web&lang=fr&idprofession=4&idp=59E6BE7B2022Z09Z07X11C45C2226F732387624554&idtyperdv=14274&idlieux=2304&nbpersonne=1&filtreall=',
];

const TIME_INTERVAL = 1000 * 10;

const NOTIFICATION_TITLE = 'Available';
const NOTIFICATION_BODY = 'A rendez-vous is available';

export default function Page() {
  const runnable = async () => {
    const toFetch = URL_TO_FETCH.map((url) => axios.get(url));
    const jsonResp = await Promise.all(toFetch).then((res) => {
      return res.map((r) => r.data);
    });
    jsonResp.forEach((arr) => {
      const available = arr[0].success !== 0 || arr[0].code_error !== 1;
      console.log('Is a rendez-vous available? <=> ', available);
      if (available) {
        new Notification(NOTIFICATION_TITLE, {
          body: NOTIFICATION_BODY,
        }).onclick = () => {
          window.focus();
        };
      }
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      runnable();
    }, TIME_INTERVAL);
    return () => clearTimeout(timer);
  }, []);

  return <div />;
}
