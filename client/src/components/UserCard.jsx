import { Link } from 'react-router-dom';

const userCard = ({ isModal = false, index, user }) => {
  const bgIndex = (index % 4) + 1;

  return (
    <div
      className={`sandwich-card ${true && 'voted'} ${
        !isModal
          ? 'thumb flex w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4 xxl:w-1/5'
          : 'thumb modal__thumb flex flex-col md:flex-row justify-center voted'
      }`}
    >
      <div
        className={`card-wrapper card-bg-${bgIndex} ${
          !isModal
            ? 'thumb__wrapper flex flex-col flex-1 justify-between m-2 sm:m-3 p-2 sm:p-4 box-shadow-10'
            : 'thumb__wrapper md:w-2/3 flex flex-col flex-shrink-0 justify-between p-2 sm:p-4 box-shadow-10'
        }`}
      >
        <div className="card-header text-center">
          {user.name && (
            <h3
              className={`card-title ${
                !isModal
                  ? 'thumb__title text-sm sm:text-base xl:text-lg font-bold uppercase text-shadow-5 py-4'
                  : 'thumb__title text-base sm:text-lg lg:text-xl font-bold uppercase text-shadow-5'
              }`}
            >
              <Link className="p-3" to={`/family/${user.id}`}>
                {user.name}
              </Link>
            </h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default userCard;
