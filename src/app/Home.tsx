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

type Notification = {
  id: string;
  urlToFetch: string;
  responseSaved?: any;
};

export default function Page() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timeInterval, setTimeInterval] = useState(10000);

  const randomUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // eslint-disable-next-line no-bitwise
      const r = (Math.random() * 16) | 0;
      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const runnable = async () => {
    for (let i = 0; i < notifications.length; i += 1) {
      const notification = notifications[i];
      const { id, urlToFetch } = notification;

      if (!urlToFetch) {
        return;
      }

      try {
        let prevNotif: Notification | undefined;
        const response = await axios.get(urlToFetch);
        const responseData = JSON.stringify(response.data);
        setNotifications((prevState) =>
          prevState.map((prevNotification) => {
            if (prevNotification.id === id) {
              prevNotif = structuredClone(prevNotification);
              return {
                ...prevNotification,
                responseSaved: responseData,
              };
            }
            return prevNotification;
          })
        );
        if (prevNotif && responseData !== prevNotif?.responseSaved) {
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
    field: keyof Notification,
    value: any
  ) => {
    setNotifications((prevState) => {
      const updatedNotifications = prevState.map((notification) => {
        if (notification.id === id) {
          return {
            ...notification,
            [field]: value,
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
            Time Interval for each call (in seconds):
          </InputLabel>
          <Input
            id="timeInterval"
            type="number"
            value={timeInterval / 1000}
            onChange={(e) =>
              setTimeInterval(parseInt(e.target.value, 10) * 1000)
            }
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
              <Card sx={{ marginTop: '20px' }}>
                <CardContent>
                  <Typography variant="h5" component="h2">
                    Result
                  </Typography>
                  <Typography variant="body2" component="div">
                    <pre>
                      {JSON.stringify(notification.responseSaved, null, 2)}
                    </pre>
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
