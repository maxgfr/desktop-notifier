import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Input,
  Card,
  CardContent,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import comparator from './utils/comparator';
import { Notif } from './types';
import randomUUID from './utils/randomId';
import HtmlViewer from './components/HtmlViewer';

export default function Page() {
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [timeInterval, setTimeInterval] = useState(1000);
  const [threshold, setThreshold] = useState(3);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runnable = async () => {
    for (let i = 0; i < notifications.length; i += 1) {
      const notification = notifications[i];
      const { id, urlToFetch } = notification;

      if (!urlToFetch) {
        return;
      }

      try {
        let prevNotif: Notif | undefined;
        let responseInHtml: string | undefined;
        const response = await axios.get(urlToFetch);
        let responseData: any;
        if (response.headers['content-type'].includes('application/json')) {
          responseData = JSON.stringify(response.data);
        } else {
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(response.data, 'text/html');
          const content = htmlDoc.querySelector('html');
          // disable js from content
          const scripts = content?.querySelectorAll('script');
          scripts?.forEach((script) => {
            script.remove();
          });
          responseInHtml = content?.innerHTML;
          const body = htmlDoc.querySelector('body');
          responseData = body?.textContent;
        }
        setNotifications((prevState) =>
          prevState.map((prevNotification) => {
            if (prevNotification.id === id) {
              prevNotif = structuredClone(prevNotification);
              return {
                ...prevNotification,
                responseSaved: responseData,
                iteration: prevNotification.iteration + 1,
                responseSavedHtml: responseInHtml,
                type: responseInHtml ? 'html' : 'json',
              };
            }
            return prevNotification;
          })
        );
        if (
          comparator({
            prevRespData: prevNotif?.responseSaved,
            currentRespData: responseData,
            iteration: prevNotif?.iteration,
            threshold: threshold / 100,
          })
        ) {
          new Notification(`${prevNotif?.urlToFetch}`, {
            body: `The content has changed for ${prevNotif?.urlToFetch}`,
          }).onclick = () => {
            window.focus();
          };
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setNotifications((prevState) =>
          prevState.map((prevNotification) => {
            if (prevNotification.id === id) {
              return {
                ...prevNotification,
                responseSaved: '',
                iteration: prevNotification.iteration + 1,
              };
            }
            return prevNotification;
          })
        );
      }
    }
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const timer = setInterval(() => {
      runnable();
    }, timeInterval);
    return () => {
      clearInterval(timer);
    };
  }, [runnable, timeInterval]);

  const handleNotificationChange = (
    id: string,
    field: keyof Notif,
    value: any
  ) => {
    setNotifications((prevState) => {
      const updatedNotifications = prevState.map((notification) => {
        if (notification.id === id) {
          return {
            ...notification,
            [field]: value,
            iteration: 0,
          };
        }
        return notification;
      });
      return updatedNotifications;
    });
  };

  const handleAddNotification = () => {
    setNotifications((prevState) => [
      ...prevState,
      {
        title: '',
        body: '',
        urlToFetch: '',
        id: randomUUID(),
        iteration: 0,
        type: 'json',
      },
    ]);
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications((prevState) => {
      const updatedNotifications = prevState.filter(
        (notification) => notification.id !== id
      );
      return updatedNotifications;
    });
  };

  return (
    <Container>
      <Box sx={{ marginTop: '20px' }}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Desktop Notifier
        </Typography>
      </Box>
      <Box display="flex" flexDirection="column">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            marginTop: '20px',
          }}
          fontWeight="bold"
        >
          Notifications
        </Typography>
        <FormControl sx={{ marginY: '20px' }}>
          <InputLabel htmlFor="timeInterval">
            Time Interval for each call (in milliseconds):
          </InputLabel>
          <Input
            id="timeInterval"
            type="number"
            value={timeInterval}
            onChange={(e) => setTimeInterval(parseInt(e.target.value, 10))}
          />
        </FormControl>
        <FormControl sx={{ marginY: '20px' }}>
          <InputLabel htmlFor="threshold">
            Percentage of difference between previous and new html screenshot
            (in %):
          </InputLabel>
          <Input
            id="threshold"
            type="number"
            inputProps={{
              step: 0.01,
              min: 0,
              max: 100,
            }}
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
          />
        </FormControl>
        {notifications.map((notification) => (
          <Box
            key={`${notification.id}`}
            sx={{ display: 'flex', marginTop: '30px', flexDirection: 'column' }}
          >
            <FormControl sx={{ marginTop: '15px' }}>
              <InputLabel htmlFor="urlToFetch">URL to fetch</InputLabel>
              <Input
                id="urlToFetch"
                type="text"
                value={notification.urlToFetch}
                onChange={(e) =>
                  handleNotificationChange(
                    notification.id,
                    'urlToFetch',
                    e.target.value
                  )
                }
              />
            </FormControl>
            {notification.responseSaved && (
              <Card sx={{ marginTop: '20px', height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{ marginBottom: '10px' }}
                  >
                    Result
                  </Typography>
                  <Typography variant="body2" component="div">
                    {notification.responseSavedHtml ? (
                      <Box height="500px" maxWidth="100%" overflow="auto">
                        <HtmlViewer html={notification.responseSavedHtml} />
                      </Box>
                    ) : (
                      <pre>
                        {JSON.stringify(notification.responseSaved, null, 2)}
                      </pre>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            )}
            <Button
              variant="text"
              onClick={() => handleRemoveNotification(notification.id)}
              sx={{
                marginTop: '15px',
              }}
            >
              Remove
            </Button>
          </Box>
        ))}
        <Button
          variant="contained"
          onClick={handleAddNotification}
          sx={{
            marginY: '40px',
          }}
        >
          Add Notification
        </Button>
      </Box>
    </Container>
  );
}
