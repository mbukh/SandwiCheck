import { useEffect, useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';

import { ROUTE_PATHS } from '../routes';

const BADGE_STYLES = {
  warning: 'bg-yellow-300 text-black',
  success: 'bg-green-500 text-white',
  info: 'bg-magenta text-white',
};

const UserCard = ({
  index,
  user,
  isParentSession,
  isActingAsChild,
  isActive,
  onLoginChild,
  onConvertChild,
  onResendInvite,
  isLoginLoading,
  isConvertLoading,
  isResendLoading,
}) => {
  const bgIndex = (index % 4) + 1;
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);
  const [emailValue, setEmailValue] = useState(user.email || '');
  const [formError, setFormError] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);

  const isTetheredChild = !user.email || user.isTetheredChild;
  const isEmailConfirmed = Boolean(user.email && user.emailConfirmed);
  const isPendingConfirmation = Boolean(user.email && !user.emailConfirmed);

  const badgeList = useMemo(() => {
    const badges = [];
    if (isTetheredChild) {
      badges.push({ label: 'Tethered', variant: 'warning' });
    }
    if (isPendingConfirmation) {
      badges.push({ label: 'Pending', variant: 'warning' });
    }
    if (isEmailConfirmed) {
      badges.push({ label: 'Independent', variant: 'success' });
    }
    if (isActive) {
      badges.push({ label: 'Current', variant: 'info' });
    }
    return badges;
  }, [isActive, isEmailConfirmed, isPendingConfirmation, isTetheredChild]);

  const canLoginAsChild = isParentSession && !isActive;
  const canManageEmail = (isParentSession || (isActingAsChild && isActive)) && Boolean(onConvertChild);
  const canResendInvite = Boolean(onResendInvite) && Boolean(user.email) && !user.emailConfirmed;

  useEffect(() => {
    setEmailValue(user.email || '');
    setFormError('');
    setIsEmailFormOpen(false);
  }, [user.email]);

  const handleSubmitEmail = async (event) => {
    event.preventDefault();
    if (!onConvertChild || isSubmittingEmail || isConvertLoading) return;

    const trimmedEmail = emailValue.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setFormError('Invalid email address');
      return;
    }

    setFormError('');
    setIsSubmittingEmail(true);
    const res = await onConvertChild(trimmedEmail);
    if (res?.success) {
      setIsEmailFormOpen(false);
    } else {
      setFormError(res?.error?.message || 'Failed to send invite.');
    }
    setIsSubmittingEmail(false);
  };

  return (
    <div
      className={`sandwich-card thumb flex w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4 xxl:w-1/5 ${isActive ? 'active-card' : ''}`}
    >
      <div
        className={`card-wrapper card-bg-${bgIndex} thumb__wrapper flex flex-col flex-1 justify-between m-2 sm:m-3 p-2 sm:p-4 box-shadow-10 relative overflow-hidden`}
      >
        {/* Header */}
        <div className="card-header text-center z-0">
          <div className="flex justify-center flex-wrap gap-1 mb-1">
            {badgeList.map((badge) => (
              <span
                key={badge.label}
                className={`inline-block px-1.5 py-0.5 rounded-full text-xxs uppercase tracking-wide font-bold box-shadow-5 ${BADGE_STYLES[badge.variant]}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <h3 className="card-title thumb__title text-base sm:text-lg lg:text-xl font-bold uppercase text-shadow-5 truncate px-1">
            <Link to={ROUTE_PATHS.FAMILY_CHILD} params={{ childId: user.id }} className="hover:underline">
              {user.name}
            </Link>
          </h3>
        </div>

        {/* Middle - Child Avatar */}
        <div className="card-middle my-auto relative z-0">
          <div className="card-orb w-full mx-auto aspect-square flex items-center justify-center relative">
            <span className="text-6xl md:text-7xl font-bold text-white drop-shadow-md select-none">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer flex flex-col items-center gap-2 mt-auto z-0">
          <div className="text-xs text-center text-shadow-5 min-h-[2.5em] flex flex-col justify-center px-2">
            {user.email ? (
              <>
                <p className="font-semibold truncate max-w-[150px] mx-auto mb-0.5" title={user.email}>
                  {user.email}
                </p>
                <p className="text-xxs uppercase opacity-75 font-medium">
                  {user.emailConfirmed ? (
                    <span className="text-green-700">✓ Confirmed</span>
                  ) : (
                    <span className="text-yellow-700">⏳ Pending</span>
                  )}
                </p>
              </>
            ) : (
              <p className="italic opacity-75 text-xxs">Tethered Account Only</p>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-1 w-full">
            <Link
              to={ROUTE_PATHS.FAMILY_CHILD}
              params={{ childId: user.id }}
              className="button bg-white text-magenta text-xxs sm:text-xs px-2 py-1 uppercase font-bold rounded shadow-sm hover:scale-105 transition-transform"
            >
              View Menu
            </Link>

            {canLoginAsChild && (
              <button
                type="button"
                onClick={onLoginChild}
                disabled={isLoginLoading}
                className="button bg-magenta text-white text-xxs sm:text-xs px-2 py-1 uppercase font-bold rounded shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isLoginLoading ? '...' : 'Login as Child'}
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-1 w-full mt-1">
            {canManageEmail && (
              <button
                type="button"
                onClick={() => setIsEmailFormOpen(true)}
                className="button bg-white text-magenta border border-magenta text-xxs sm:text-xs px-2 py-1 uppercase font-bold rounded shadow-sm hover:scale-105 transition-transform"
              >
                {user.email ? 'Change Email' : 'Assign Email'}
              </button>
            )}

            {canResendInvite && (
              <button
                type="button"
                onClick={onResendInvite}
                disabled={isResendLoading}
                className="button bg-yellow-400 text-black text-xxs sm:text-xs px-2 py-1 uppercase font-bold rounded shadow-sm hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isResendLoading ? '...' : 'Resend Invite'}
              </button>
            )}
          </div>
        </div>

        {/* Email Form Overlay */}
        {isEmailFormOpen && (
          <div
            className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center box-shadow-10 rounded-lg fade-in-immediate card-bg-${bgIndex}`}
            style={{ backgroundColor: `var(--card-bg-${bgIndex})` }}
          >
            <h4 className="text-white font-bold uppercase text-sm md:text-base mb-3 text-shadow-10">
              {user.email ? 'Change Email Address' : 'Assign Email Address'}
            </h4>
            <p className="text-xs text-magenta/70 mb-3">
              {user.email
                ? 'Update the email address for this child account.'
                : 'Add an email to allow this child to log in independently.'}
            </p>
            <form onSubmit={handleSubmitEmail} className="w-full max-w-xs">
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="child@example.com"
                className="w-full p-2.5 text-sm border-2 border-magenta/30 rounded-lg mb-2 text-magenta placeholder-magenta/40 focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 bg-white box-shadow-5"
                autoFocus
                disabled={isSubmittingEmail || isConvertLoading}
              />
              {formError && (
                <p className="text-red-600 text-xs font-bold mb-2 text-shadow-5 bg-red-50 p-2 rounded">{formError}</p>
              )}
              <div className="flex justify-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailFormOpen(false);
                    setFormError('');
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase text-magenta border-2 border-magenta rounded-lg hover:bg-magenta/5 transition-colors disabled:opacity-50"
                  disabled={isSubmittingEmail || isConvertLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmail || isConvertLoading}
                  className="px-4 py-2 text-xs font-bold uppercase text-white bg-magenta rounded-lg hover:bg-magenta/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors box-shadow-5"
                >
                  {isSubmittingEmail || isConvertLoading ? 'Sending...' : user.email ? 'Update' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCard;
