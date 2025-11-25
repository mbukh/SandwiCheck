import { useEffect, useMemo, useState } from 'react';
import { Link, useMatchRoute, Outlet, useNavigate } from '@tanstack/react-router';

import { useAuthGlobalContext } from '../context/AuthGlobalContext';
import { ROUTE_PATHS } from '../routes';

import Loading from '../components/Loading';
import UserCard from '../components/UserCard';
import useToast from '../hooks/use-toast';
import * as apiUsers from '../services/api-users';
import * as apiAuth from '../services/api-auth';
import { logResponse } from '../utils/log';
import Modal from '../components/Modal/Modal';

const Family = () => {
  const {
    currentUser,
    parentUser,
    actingAsChild,
    isCurrentUserReady,
    createChild,
    loginChild,
    switchToParent,
    refreshSession,
  } = useAuthGlobalContext();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();
  const { showToast, toastComponents } = useToast();

  const [isAddChildOpen, setIsAddChildOpen] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [isCreatingChild, setIsCreatingChild] = useState(false);
  const [createError, setCreateError] = useState('');
  const [convertChildId, setConvertChildId] = useState(null);
  const [loginChildId, setLoginChildId] = useState(null);
  const [resendChildId, setResendChildId] = useState(null);
  const [isSwitchingParent, setIsSwitchingParent] = useState(false);

  useEffect(() => {
    if (isCurrentUserReady && !currentUser.id) {
      navigate({ to: ROUTE_PATHS.LOGIN, replace: true });
    }
  }, [isCurrentUserReady, currentUser.id, navigate]);

  useEffect(() => {
    const isOnChildRoute = Boolean(matchRoute({ to: '/family/$childId' }));
    if (actingAsChild && !isOnChildRoute) {
      setIsAddChildOpen(false);
    }
  }, [actingAsChild, matchRoute]);

  const isParentSession = currentUser.roles?.includes('parent') && !actingAsChild;
  const activeChildId = actingAsChild ? currentUser.id : null;
  const familyOwner = isParentSession ? currentUser : parentUser || currentUser;
  const children = useMemo(() => {
    if (isParentSession) {
      return currentUser.children || [];
    }
    return parentUser?.children || [];
  }, [currentUser.children, isParentSession, parentUser?.children]);

  const signupOrigin =
    globalThis.window === undefined
      ? globalThis?.location
        ? `${globalThis.location.protocol}//${globalThis.location.host}`
        : ''
      : globalThis.location.origin;
  const shareLink = familyOwner?.id
    ? `https://wa.me/?text=Hey%20kids%2C%20join%20me%20at%20SandwiCheck%20and%20be%20a%20part%20of%20my%20sandwich%20squad%21+${signupOrigin}${ROUTE_PATHS.SIGNUP_PARENT.replace('$parentId', familyOwner.id)}`
    : '';

  const resetActionStates = () => {
    setConvertChildId(null);
    setLoginChildId(null);
    setResendChildId(null);
    setIsSwitchingParent(false);
  };

  const handleCreateChild = async (event) => {
    event.preventDefault();
    if (isCreatingChild) return;

    const trimmedName = newChildName.trim();
    if (!trimmedName) {
      setCreateError('Please enter a name for the child');
      return;
    }

    setCreateError('');
    setIsCreatingChild(true);

    const res = await createChild({ name: trimmedName });
    logResponse('🧒 Create tethered child', res);

    if (!res?.success) {
      setCreateError(res?.error?.message || 'Unable to create child. Please try again.');
      setIsCreatingChild(false);
      return;
    }

    showToast(`Child "${res?.data?.name || trimmedName}" created successfully.`);
    setNewChildName('');
    setIsAddChildOpen(false);
    setIsCreatingChild(false);
  };

  const handleLoginChild = async (child) => {
    setLoginChildId(child.id);
    const res = await loginChild({ childId: child.id });
    logResponse('👶 Login as child (impersonation)', res);

    if (!res?.success) {
      showToast(res?.error?.message || 'Unable to login as child. Please try again.');
      setLoginChildId(null);
      return res;
    }

    showToast(`Managing ${child.name}'s menu.`);
    setLoginChildId(null);
    navigate({ to: ROUTE_PATHS.MENU });
    return res;
  };

  const handleConvertChild = async (childId, email) => {
    setConvertChildId(childId);
    const res = await apiUsers.updateUserById(childId, { email });
    logResponse('✉️ Convert tethered child', res);

    if (!res?.success) {
      showToast(res?.error?.message || 'Unable to send invitation. Please try again.');
      setConvertChildId(null);
      return res;
    }

    await refreshSession();
    showToast(`Invitation sent to ${email}. Ask them to confirm their email and set a password.`);
    setConvertChildId(null);
    return res;
  };

  const handleResendInvite = async (child) => {
    if (!child.email) {
      showToast('Add an email address first to send an invitation.');
      return { success: false };
    }

    setResendChildId(child.id);
    const res = await apiAuth.resendConfirmation(child.email);
    logResponse('📨 Resend child confirmation', res);

    if (!res?.success) {
      showToast(res?.error?.message || 'Unable to resend confirmation email right now.');
      setResendChildId(null);
      return res;
    }

    showToast(`Confirmation email resent to ${child.email}.`);
    setResendChildId(null);
    return res;
  };

  const handleSwitchToParent = async () => {
    setIsSwitchingParent(true);
    const res = await switchToParent();
    logResponse('🏠 Switch back to parent', res);

    if (!res?.success) {
      showToast(res?.error?.message || 'Unable to switch back right now.');
      resetActionStates();
      return;
    }

    showToast(`Back as ${res?.data?.name || 'parent'}.`);
    resetActionStates();
    navigate({ to: ROUTE_PATHS.FAMILY });
  };

  if (!isCurrentUserReady) return <Loading />;
  if (isCurrentUserReady && !currentUser.id) return null;

  // If viewing a specific child's menu under /family/$childId, render nested route only
  const isOnChildRoute = Boolean(matchRoute({ to: '/family/$childId' }));
  if (isOnChildRoute) {
    return <Outlet />;
  }

  // If acting as child, show restricted view
  if (actingAsChild) {
    return (
      <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
        <h1 className="text-center text-l uppercase text-shadow-10">My family</h1>
        <div className="flex flex-col items-center gap-4 mt-8 mb-6 text-shadow-5 animate-fade-in">
          <p className="text-base md:text-lg text-center max-w-md">
            You are managing <strong>{currentUser.name}</strong>&apos;s account.
          </p>
          <p className="text-xs md:text-sm text-center text-magenta/80 max-w-md">
            Family management is restricted. Return to your parent account to manage family members.
          </p>
          <button
            type="button"
            onClick={handleSwitchToParent}
            disabled={isSwitchingParent}
            className="button bg-white text-magenta border-2 border-magenta px-6 py-3 rounded-lg text-sm md:text-base uppercase font-bold hover:scale-105 transition-transform box-shadow-10"
          >
            {isSwitchingParent ? 'Switching...' : 'Return to Parent Account'}
          </button>
        </div>
        {toastComponents}
      </div>
    );
  }

  return (
    <div className="sandwich-gallery pt-4 pb-12 px-5 md:pt-6 md:pb-16 md:px-12 lg:pb-20 xl:px-20">
      <h1 className="text-center text-l uppercase text-shadow-10">My family</h1>

      <RestoredFromChildNote />
 
      {isParentSession && (
        <div className="sandwich-gallery-title w-full py-4 px-5 md:py-5 md:px-12 xl:px-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 flex-wrap text-shadow-10">
              <button
                type="button"
                className="inline-flex items-center justify-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white py-2 px-4 md:py-3 md:px-5 text-xs md:text-sm xl:box-shadow-20 hover:scale-105 transition-transform duration-200"
                onClick={() => setIsAddChildOpen(true)}
              >
                <i className="icon icon-plus h-4 w-4 md:h-5 md:w-5 mr-2"></i>
                Add child
              </button>

              {shareLink && (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white py-2 px-4 md:py-3 md:px-5 text-xs md:text-sm xl:box-shadow-20 hover:scale-105 transition-transform duration-200"
                    onClick={async () => {
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(shareLink);
                          showToast('Invite link copied to clipboard!');
                        } else {
                          // Fallback for older browsers
                          const textArea = document.createElement('textarea');
                          textArea.value = shareLink;
                          textArea.style.position = 'fixed';
                          textArea.style.opacity = '0';
                          document.body.appendChild(textArea);
                          textArea.select();
                          try {
                            document.execCommand('copy');
                            showToast('Invite link copied to clipboard!');
                          } catch (err) {
                            showToast('Failed to copy link. Please copy manually.');
                          }
                          document.body.removeChild(textArea);
                        }
                      } catch (err) {
                        showToast('Failed to copy link. Please copy manually.');
                      }
                    }}
                  >
                    <i className="icon icon-select-arrows h-4 w-4 md:h-5 md:w-5 mr-2"></i>
                    Copy invite link
                  </button>
                  <Link
                    className="inline-flex items-center gap-2 appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white py-2 px-4 md:py-3 md:px-5 text-xs md:text-sm xl:box-shadow-20 hover:scale-105 transition-transform duration-200"
                    to={shareLink}
                    target="_blank"
                  >
                    <span>Send invite link</span>
                    <i className="icon icon-whatsapp h-5 w-5 md:h-6 md:w-6"></i>
                  </Link>
                </>
              )}
            </div>
          </div>

          {isAddChildOpen && (
            <Modal isModalLoading={false} closeLink="stay" modalId="add-child-modal" setIsOpenLoginModal={setIsAddChildOpen}>
              <div className="w-full max-w-screen-sm md:max-w-screen-md mx-auto px-4">
                <form className="bg-white/95 rounded-lg p-4 md:p-6 box-shadow-10" onSubmit={handleCreateChild}>
                  <h2 className="text-center text-sm md:text-base uppercase text-magenta font-bold mb-4">Add a child</h2>
                  <div className="mb-4">
                    <label className="block text-xs md:text-sm uppercase mb-2 text-magenta font-bold" htmlFor="child-name">
                      Child name
                    </label>
                    <input
                      id="child-name"
                      type="text"
                      className="w-full appearance-none focus:outline-none rounded-lg box-shadow-10 bg-white text-magenta text-sm md:text-base py-2 px-4 md:py-3 md:px-6 xl:box-shadow-20 border-none placeholder-magenta/50"
                      placeholder="e.g. Jamie"
                      value={newChildName}
                      onChange={(event) => setNewChildName(event.target.value)}
                      disabled={isCreatingChild}
                      autoFocus
                    />
                  </div>
                  {createError && <p className="text-xs text-red-500 mt-2 font-bold">{createError}</p>}
                  <div className="flex justify-end mt-4 gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-white text-magenta border border-magenta py-2 px-4 text-xs md:text-sm"
                      onClick={() => setIsAddChildOpen(false)}
                      disabled={isCreatingChild}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center appearance-none focus:outline-none rounded-lg box-shadow-10 font-bold uppercase bg-magenta text-white py-2 px-6 md:py-3 md:px-8 text-xs md:text-sm xl:box-shadow-20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform duration-200"
                      disabled={isCreatingChild}
                    >
                      {isCreatingChild ? 'Creating…' : 'Create child'}
                    </button>
                  </div>
                </form>
              </div>
            </Modal>
          )}
        </div>
      )}

      <div className="size-full flex flex-wrap -mx-2 sm:-mx-3 text-shadow-10 no-wrap shrink-0">
        {children.length > 0 ? (
          children.map((child, index) => (
            <UserCard
              key={child.id}
              index={index}
              user={child}
              isParentSession={isParentSession}
              isActingAsChild={actingAsChild}
              isActive={activeChildId === child.id}
              onLoginChild={() => handleLoginChild(child)}
              onConvertChild={(email) => handleConvertChild(child.id, email)}
              onResendInvite={() => handleResendInvite(child)}
              isLoginLoading={loginChildId === child.id}
              isConvertLoading={convertChildId === child.id}
              isResendLoading={resendChildId === child.id}
            />
          ))
        ) : (
          <div className="w-full bg-white/80 rounded-lg p-6 md:p-8 text-center text-shadow-5 box-shadow-10">
            <p className="text-sm md:text-base">
              {isParentSession
                ? 'Add your first child to start planning family sandwiches together.'
                : parentUser?.name
                  ? `${parentUser.name} has not added any tethered children yet.`
                  : 'No family members available yet.'}
            </p>
          </div>
        )}
      </div>

      {toastComponents}
    </div>
  );
};

export default Family;
 
const RestoredFromChildNote = () => {
  const [restoredName, setRestoredName] = useState('');
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('restoredFromChild');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.childName) {
          setRestoredName(parsed.childName);
        }
        sessionStorage.removeItem('restoredFromChild');
      }
    } catch {
      // no-op
    }
  }, []);
 
  if (!restoredName) return null;
  return (
    <div className="text-center text-xs md:text-sm mt-1 mb-3 text-magenta font-bold uppercase text-shadow-5">
      Switched from managing {restoredName} back to your parent account
    </div>
  );
};
