import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { randomUUID } from 'crypto';

type Notification = {
  id: string;
  title: string;
  body: string;
  urlToFetch: string;
  responseSaved?: any;
};

export default function Page() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [timeInterval, setTimeInterval] = useState(10000);
  const [processRunning, setProcessRunning] = useState(false);

  const runnable = useCallback(() => {
    for (let i = 0; i < notifications.length; i += 1) {
      const notification = notifications[i];
      const { body, title, id, urlToFetch } = notification;

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
        if (prevNotif && responseData === prevNotif?.responseSaved) {
          new Notification(title, {
            body,
          }).onclick = () => {
            window.focus();
          };
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }, [notifications]);

  useEffect(() => {
    if (processRunning) {
      const timer = setInterval(() => {
        runnable();
      }, timeInterval);
      return () => {
        clearInterval(timer);
      };
    }
  }, [processRunning, runnable, timeInterval]);

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
    <div>
      <div>
        <h3>Notifications:</h3>
        <div>
          <label>Time Interval (in milliseconds):</label>
          <input
            type="number"
            value={timeInterval}
            onChange={(e) => setTimeInterval(parseInt(e.target.value, 10))}
          />
        </div>
        {processRunning ? (
          <button type="button" onClick={() => setProcessRunning(false)}>
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (notifications.length === 0) {
                alert('Add at least one notification');
              }
              setProcessRunning(true);
            }}
          >
            Start
          </button>
        )}
        {notifications.map((notification) => (
          <div key={`${notification.id}`}>
            <div>
              <label htmlFor="title">Notification Title:</label>
              <input
                id="title"
                type="text"
                value={notification.title}
                onChange={(e) =>
                  handleNotificationChange(
                    notification.id,
                    'title',
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <label>Notification Body:</label>
              <input
                type="text"
                value={notification.body}
                onChange={(e) =>
                  handleNotificationChange(
                    notification.id,
                    'body',
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <label>URL to Fetch:</label>
              <input
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
            </div>
            <button
              type="button"
              onClick={() => handleRemoveNotification(notification.id)}
            >
              Remove
            </button>
          </div>
        ))}
        <button onClick={handleAddNotification} type="button">
          Add Notification
        </button>
      </div>
    </div>
  );
}
