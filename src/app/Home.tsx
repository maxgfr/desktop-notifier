import axios, { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

interface NotificationData<T> {
  availableCondition: string;
  notificationTitle: string;
  notificationBody: string;
  timeInterval: number;
  urlToFetch: string;
  responseData?: AxiosResponse<T>;
}

export default function Page(): JSX.Element {
  const [notificationData, setNotificationData] = useState<
    NotificationData<any>[]
  >([]);
  const [processRunning, setProcessRunning] = useState(false);

  const handleConfirm = () => {
    if (notificationData.length > 0) {
      setProcessRunning(true);
    }
  };

  const runnable = async () => {
    for (const notification of notificationData) {
      const {
        availableCondition,
        notificationTitle,
        notificationBody,
        timeInterval,
        urlToFetch,
      } = notification;
      try {
        const response = await axios.get<any>(urlToFetch);
        setNotificationData((prevState) =>
          prevState.map((prevNotification) =>
            prevNotification.urlToFetch === urlToFetch
              ? { ...prevNotification, responseData: response }
              : prevNotification
          )
        );
        const available = eval(availableCondition); // Evaluate the condition dynamically
        console.log('Is a rendez-vous available? <=> ', available);
        if (available) {
          new Notification(notificationTitle, {
            body: notificationBody,
          }).onclick = () => {
            window.focus();
          };
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  };

  useEffect(() => {
    if (processRunning) {
      const timers: NodeJS.Timeout[] = [];
      notificationData.forEach((notification) => {
        const timer = setInterval(() => {
          runnable();
        }, notification.timeInterval);
        timers.push(timer);
      });
      return () => {
        timers.forEach((timer) => clearInterval(timer));
      };
    }
  }, [processRunning, notificationData]);

  const handleNotificationChange = (
    index: number,
    field: keyof NotificationData<any>,
    value: any
  ) => {
    setNotificationData((prevState) => {
      const updatedNotificationData = [...prevState];
      updatedNotificationData[index] = {
        ...updatedNotificationData[index],
        [field]: value,
      };
      return updatedNotificationData;
    });
  };

  const handleAddNotification = () => {
    setNotificationData((prevState) => [
      ...prevState,
      {
        availableCondition: '',
        notificationTitle: '',
        notificationBody: '',
        timeInterval: 10000, // Default time interval (10 seconds)
        urlToFetch: '',
      },
    ]);
  };

  const handleRemoveNotification = (index: number) => {
    setNotificationData((prevState) => {
      const updatedNotificationData = [...prevState];
      updatedNotificationData.splice(index, 1);
      return updatedNotificationData;
    });
  };

  return (
    <div>
      <div>
        <h3>Notifications:</h3>
        {notificationData.map((notification, index) => (
          <div key={index}>
            <div>
              <label>Available Condition:</label>
              <input
                type="text"
                value={notification.availableCondition}
                onChange={(e) =>
                  handleNotificationChange(
                    index,
                    'availableCondition',
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <label>Notification Title:</label>
              <input
                type="text"
                value={notification.notificationTitle}
                onChange={(e) =>
                  handleNotificationChange(
                    index,
                    'notificationTitle',
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <label>Notification Body:</label>
              <input
                type="text"
                value={notification.notificationBody}
                onChange={(e) =>
                  handleNotificationChange(
                    index,
                    'notificationBody',
                    e.target.value
                  )
                }
              />
            </div>
            <div>
              <label>Time Interval (in milliseconds):</label>
              <input
                type="number"
                value={notification.timeInterval}
                onChange={(e) =>
                  handleNotificationChange(
                    index,
                    'timeInterval',
                    parseInt(e.target.value, 10)
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
                  handleNotificationChange(index, 'urlToFetch', e.target.value)
                }
              />
            </div>
            <button onClick={() => handleRemoveNotification(index)}>
              Remove
            </button>
          </div>
        ))}
        <button onClick={handleAddNotification}>Add Notification</button>
      </div>
      <button onClick={handleConfirm}>Confirm</button>
    </div>
  );
}
