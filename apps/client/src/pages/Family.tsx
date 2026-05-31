import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import Loading from '@/components/Loading';
import Modal from '@/components/Modal/Modal';
import UserCard from '@/components/UserCard';
import { ROUTE_PATHS } from '@/constants/route-paths';
import { useAuthGlobalContext } from '@/context/AuthGlobalContext';
import useToast from '@/hooks/use-toast';
import * as apiAuth from '@/services/api-auth';
import * as apiUsers from '@/services/api-users';
import type { ApiResult } from '@/types/api';
import type { User } from '@/types/domain';
import { logResponse } from '@/utils/log';

const Family = (): React.JSX.Element | null => {
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
  const [convertChildId, setConvertChildId] = useState<string | null>(null);
  const [loginChildId, setLoginChildId] = useState<string | null>(null);
  const [resendChildId, setResendChildId] = useState<string | null>(null);
  const [isSwitchingParent, setIsSwitchingParent] = useState(false);

  useEffect(() => {
    if (isCurrentUserReady && !currentUser.id) {
      navigate({ to: ROUTE_PATHS.LOGIN, replace: true });
    }
  }, [isCurrentUserReady, currentUser.id, navigate]);

  // Close the add-child modal when entering child-acting mode (the modal is parent-session only).
  const [wasActingAsChild, setWasActingAsChild] = useState(actingAsChild);
  if (actingAsChild !== wasActingAsChild) {
    setWasActingAsChild(actingAsChild);
    if (actingAsChild) {
      setIsAddChildOpen(false);
    }
  }

  const isParentSession = Boolean(currentUser.roles?.includes('parent')) && !actingAsChild;
  const activeChildId = actingAsChild ? currentUser.id : null;
  const familyOwner = isParentSession ? currentUser : parentUser || currentUser;
  const children = useMemo<User[]>(() => {
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
  const ownerId = familyOwner?.id;
  const shareLink = ownerId
    ? `https://wa.me/?text=Hey%20kids%2C%20join%20me%20at%20SandwiCheck%20and%20be%20a%20part%20of%20my%20sandwich%20squad%21+${signupOrigin}${ROUTE_PATHS.SIGNUP_PARENT.replace('$parentId', ownerId)}`
    : '';

  const resetActionStates = (): void => {
    setConvertChildId(null);
    setLoginChildId(null);
    setResendChildId(null);
    setIsSwitchingParent(false);
  };

  const handleCreateChild = async (event: FormEvent): Promise<void> => {
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

  const handleLoginChild = async (child: User): Promise<ApiResult<User>> => {
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

  const handleConvertChild = async (childId: string, email: string): Promise<ApiResult<User>> => {
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

  const handleResendInvite = async (child: User): Promise<ApiResult> => {
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

  const handleSwitchToParent = async (): Promise<void> => {
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
  const isOnChildRoute = Boolean(matchRoute({ to: ROUTE_PATHS.FAMILY_CHILD }));
  if (isOnChildRoute) {
    return <Outlet />;
  }

  // If acting as child, show restricted view
  if (actingAsChild) {
    return (
      <div className="sandwich-gallery px-5 pt-4 pb-12 md:px-12 md:pt-6 md:pb-16 lg:pb-20 xl:px-20">
        <h1 className="text-shadow-10 text-center text-lg uppercase">My family</h1>
        <div className="text-shadow-5 animate-fade-in mt-8 mb-6 flex flex-col items-center gap-4">
          <p className="max-w-md text-center text-base md:text-lg">
            You are managing <strong>{currentUser.name}</strong>&apos;s account.
          </p>
          <p className="max-w-md text-center text-xs text-magenta/80 md:text-sm">
            Family management is restricted. Return to your parent account to manage family members.
          </p>
          <button
            type="button"
            onClick={handleSwitchToParent}
            disabled={isSwitchingParent}
            className="button box-shadow-10 rounded-lg border-2 border-magenta bg-white px-6 py-3 text-sm font-bold text-magenta uppercase transition-transform hover:scale-105 md:text-base"
          >
            {isSwitchingParent ? 'Switching...' : 'Return to Parent Account'}
          </button>
        </div>
        {toastComponents}
      </div>
    );
  }

  return (
    <div className="sandwich-gallery px-5 pt-4 pb-12 md:px-12 md:pt-6 md:pb-16 lg:pb-20 xl:px-20">
      <h1 className="text-shadow-10 text-center text-lg uppercase">My family</h1>

      <RestoredFromChildNote />

      {isParentSession && (
        <div className="sandwich-gallery-title w-full px-5 py-4 md:px-12 md:py-5 xl:px-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-shadow-10 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="box-shadow-10 xl:box-shadow-20 inline-flex appearance-none items-center justify-center rounded-lg bg-magenta px-4 py-2 text-xs font-bold text-white uppercase transition-transform duration-200 hover:scale-105 focus:outline-none md:px-5 md:py-3 md:text-sm"
                onClick={() => setIsAddChildOpen(true)}
              >
                <i className="icon icon-plus mr-2 h-4 w-4 md:h-5 md:w-5"></i>
                Add child
              </button>

              {shareLink && (
                <>
                  <button
                    type="button"
                    className="box-shadow-10 xl:box-shadow-20 inline-flex appearance-none items-center justify-center rounded-lg bg-magenta px-4 py-2 text-xs font-bold text-white uppercase transition-transform duration-200 hover:scale-105 focus:outline-none md:px-5 md:py-3 md:text-sm"
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
                          document.body.append(textArea);
                          textArea.select();
                          try {
                            document.execCommand('copy');
                            showToast('Invite link copied to clipboard!');
                          } catch {
                            showToast('Failed to copy link. Please copy manually.');
                          }
                          textArea.remove();
                        }
                      } catch {
                        showToast('Failed to copy link. Please copy manually.');
                      }
                    }}
                  >
                    <i className="icon icon-select-arrows mr-2 h-4 w-4 md:h-5 md:w-5"></i>
                    Copy invite link
                  </button>
                  <Link
                    className="box-shadow-10 xl:box-shadow-20 inline-flex appearance-none items-center gap-2 rounded-lg bg-magenta px-4 py-2 text-xs font-bold text-white uppercase transition-transform duration-200 hover:scale-105 focus:outline-none md:px-5 md:py-3 md:text-sm"
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
            <Modal
              isModalLoading={false}
              closeLink="stay"
              modalId="add-child-modal"
              setIsOpenLoginModal={setIsAddChildOpen}
            >
              <div className="mx-auto w-full max-w-screen-sm px-4 md:max-w-3xl">
                <form className="box-shadow-10 rounded-lg bg-white/95 p-4 md:p-6" onSubmit={handleCreateChild}>
                  <h2 className="mb-4 text-center text-sm font-bold text-magenta uppercase md:text-base">
                    Add a child
                  </h2>
                  <div className="mb-4">
                    <label
                      className="mb-2 block text-xs font-bold text-magenta uppercase md:text-sm"
                      htmlFor="child-name"
                    >
                      Child name
                    </label>
                    <input
                      id="child-name"
                      type="text"
                      className="box-shadow-10 xl:box-shadow-20 w-full appearance-none rounded-lg border-none bg-white px-4 py-2 text-sm text-magenta placeholder-magenta/50 focus:outline-none md:px-6 md:py-3 md:text-base"
                      placeholder="e.g. Jamie"
                      value={newChildName}
                      onChange={(event) => setNewChildName(event.target.value)}
                      disabled={isCreatingChild}
                      autoFocus
                    />
                  </div>
                  {createError && <p className="mt-2 text-xs font-bold text-red-500">{createError}</p>}
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="box-shadow-10 inline-flex appearance-none items-center justify-center rounded-lg border border-magenta bg-white px-4 py-2 text-xs font-bold text-magenta uppercase focus:outline-none md:text-sm"
                      onClick={() => setIsAddChildOpen(false)}
                      disabled={isCreatingChild}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="box-shadow-10 xl:box-shadow-20 inline-flex appearance-none items-center justify-center rounded-lg bg-magenta px-6 py-2 text-xs font-bold text-white uppercase transition-transform duration-200 hover:scale-105 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:px-8 md:py-3 md:text-sm"
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

      <div className="text-shadow-10 -mx-2 flex size-full shrink-0 flex-wrap text-nowrap sm:-mx-3">
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
              onConvertChild={(email: string) => handleConvertChild(child.id, email)}
              onResendInvite={() => handleResendInvite(child)}
              isLoginLoading={loginChildId === child.id}
              isConvertLoading={convertChildId === child.id}
              isResendLoading={resendChildId === child.id}
            />
          ))
        ) : (
          <div className="text-shadow-5 box-shadow-10 w-full rounded-lg bg-white/80 p-6 text-center md:p-8">
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

const RestoredFromChildNote = (): React.JSX.Element | null => {
  const [restoredName, setRestoredName] = useState('');
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('restoredFromChild');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.childName) {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read of external sessionStorage on mount
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
    <div className="text-shadow-5 mt-1 mb-3 text-center text-xs font-bold text-magenta uppercase md:text-sm">
      Switched from managing {restoredName} back to your parent account
    </div>
  );
};
