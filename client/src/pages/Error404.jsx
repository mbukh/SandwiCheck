import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

const Error404 = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(navigate('/'), 5001);
  }, [navigate]);

  return (
    <>
      <h3>There are 404 sandwiches waiting for you.</h3>
      <p>You will be redirected to a homepage in 5 seconds.</p>
    </>
  );
};

export default Error404;
