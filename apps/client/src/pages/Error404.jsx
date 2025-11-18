import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';

const Error404 = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: '/' });
    }, 5001);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <h3>There are 404 sandwiches waiting for you.</h3>
      <p>You will be redirected to a homepage in 5 seconds.</p>
    </>
  );
};

export default Error404;
