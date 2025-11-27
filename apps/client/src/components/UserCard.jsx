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
      className={`sandwich-card thumb xxl:w-1/5 flex w-1/2 sm:w-1/2 lg:w-1/3 xl:w-1/4 ${isActive ? 'active-card' : ''}`}
    >
      <div
        className={`card-wrapper card-bg-${bgIndex} thumb__wrapper box-shadow-10 relative m-2 flex flex-1 flex-col justify-between overflow-hidden p-2 sm:m-3 sm:p-4`}
      >
        {/* Header */}
        <div className="card-header z-0 text-center">
          <div className="mb-1 flex flex-wrap justify-center gap-1">
            {badgeList.map((badge) => (
              <span
                key={badge.label}
                className={`box-shadow-5 inline-block rounded-full px-1.5 py-0.5 text-xxs font-bold tracking-wide uppercase ${BADGE_STYLES[badge.variant]}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <h3 className="card-title thumb__title text-shadow-5 truncate px-1 text-base font-bold uppercase sm:text-lg lg:text-xl">
            <Link to={ROUTE_PATHS.FAMILY_CHILD} params={{ childId: user.id }} className="hover:underline">
              {user.name}
            </Link>
          </h3>
        </div>

        {/* Middle - Child Avatar */}
        <div className="card-middle relative z-0 my-auto">
          <div className="card-orb relative mx-auto flex aspect-square w-full items-center justify-center">
            <span className="text-6xl font-bold text-white drop-shadow-md select-none md:text-7xl">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer z-0 mt-auto flex flex-col items-center gap-2">
          <div className="text-shadow-5 flex min-h-[2.5em] flex-col justify-center px-2 text-center text-xs">
            {user.email ? (
              <>
                <p className="mx-auto mb-0.5 max-w-[150px] truncate font-semibold" title={user.email}>
                  {user.email}
                </p>
                <p className="text-xxs font-medium uppercase opacity-75">
                  {user.emailConfirmed ? (
                    <span className="text-green-700">✓ Confirmed</span>
                  ) : (
                    <span className="text-yellow-700">⏳ Pending</span>
                  )}
                </p>
              </>
            ) : (
              <p className="text-xxs italic opacity-75">Tethered Account Only</p>
            )}
          </div>

          <div className="flex w-full flex-wrap justify-center gap-1">
            <Link
              to={ROUTE_PATHS.FAMILY_CHILD}
              params={{ childId: user.id }}
              className="button rounded bg-white px-2 py-1 text-xxs font-bold text-magenta uppercase shadow-sm transition-transform hover:scale-105 sm:text-xs"
            >
              View Menu
            </Link>

            {canLoginAsChild && (
              <button
                type="button"
                onClick={onLoginChild}
                disabled={isLoginLoading}
                className="button rounded bg-magenta px-2 py-1 text-xxs font-bold text-white uppercase shadow-sm transition-transform hover:scale-105 disabled:opacity-50 sm:text-xs"
              >
                {isLoginLoading ? '...' : 'Login as Child'}
              </button>
            )}
          </div>

          <div className="mt-1 flex w-full flex-wrap justify-center gap-1">
            {canManageEmail && (
              <button
                type="button"
                onClick={() => setIsEmailFormOpen(true)}
                className="button rounded border border-magenta bg-white px-2 py-1 text-xxs font-bold text-magenta uppercase shadow-sm transition-transform hover:scale-105 sm:text-xs"
              >
                {user.email ? 'Change Email' : 'Assign Email'}
              </button>
            )}

            {canResendInvite && (
              <button
                type="button"
                onClick={onResendInvite}
                disabled={isResendLoading}
                className="button rounded bg-yellow-400 px-2 py-1 text-xxs font-bold text-black uppercase shadow-sm transition-transform hover:scale-105 disabled:opacity-50 sm:text-xs"
              >
                {isResendLoading ? '...' : 'Resend Invite'}
              </button>
            )}
          </div>
        </div>

        {/* Email Form Overlay */}
        {isEmailFormOpen && (
          <div
            className={`box-shadow-10 fade-in-immediate absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg p-4 text-center card-bg-${bgIndex}`}
            style={{ backgroundColor: `var(--card-bg-${bgIndex})` }}
          >
            <h4 className="text-shadow-10 mb-3 text-sm font-bold text-white uppercase md:text-base">
              {user.email ? 'Change Email Address' : 'Assign Email Address'}
            </h4>
            <p className="mb-3 text-xs text-magenta/70">
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
                className="box-shadow-5 mb-2 w-full rounded-lg border-2 border-magenta/30 bg-white p-2.5 text-sm text-magenta placeholder-magenta/40 focus:border-magenta focus:ring-2 focus:ring-magenta/20 focus:outline-none"
                autoFocus
                disabled={isSubmittingEmail || isConvertLoading}
              />
              {formError && (
                <p className="text-shadow-5 mb-2 rounded bg-red-50 p-2 text-xs font-bold text-red-600">{formError}</p>
              )}
              <div className="mt-3 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailFormOpen(false);
                    setFormError('');
                  }}
                  className="rounded-lg border-2 border-magenta px-4 py-2 text-xs font-bold text-magenta uppercase transition-colors hover:bg-magenta/5 disabled:opacity-50"
                  disabled={isSubmittingEmail || isConvertLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmail || isConvertLoading}
                  className="box-shadow-5 rounded-lg bg-magenta px-4 py-2 text-xs font-bold text-white uppercase transition-colors hover:bg-magenta/90 disabled:cursor-not-allowed disabled:opacity-50"
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
