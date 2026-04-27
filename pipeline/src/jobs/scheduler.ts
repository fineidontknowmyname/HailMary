export const startScheduler = () => {
  console.log('Scheduler running...');

  setInterval(() => {
    console.log('Executing scheduled background tasks...');
  }, 3600000);
};
