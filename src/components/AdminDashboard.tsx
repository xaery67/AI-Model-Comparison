import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  SystemContent,
  db,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  Shield,
  Users,
  Megaphone,
  Plus,
  Trash2,
  CheckCircle,
  Ban,
  Search,
  Lock,
  ArrowRightLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: UserProfile | null;
  onSimulateAdmin: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onSimulateAdmin,
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<SystemContent[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // New Announcement Modal / Form
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticeType, setNoticeType] = useState<'announcement' | 'featured_model'>('announcement');
  const [noticeTargetModel, setNoticeTargetModel] = useState('');
  const [noticeIsPublished, setNoticeIsPublished] = useState(true);
  const [isSavingNotice, setIsSavingNotice] = useState(false);

  const isAdmin = currentUser?.role === 'admin';

  // Listen to Users collection (requires admin permissions in Firestore rules)
  useEffect(() => {
    if (!isAdmin) {
      setUsers([]);
      setLoadingUsers(false);
      return;
    }

    setLoadingUsers(true);
    const path = 'users';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((d) => {
          list.push({ uid: d.id, ...(d.data() as any) });
        });
        setUsers(list);
        setLoadingUsers(false);
      },
      (error) => {
        console.warn('Admin user list snapshot error:', error);
        handleFirestoreError(error, OperationType.LIST, path);
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  // Listen to System Content collection
  useEffect(() => {
    setLoadingAnnouncements(true);
    const path = 'system_content';
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snapshot) => {
        const list: SystemContent[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) });
        });
        setAnnouncements(list);
        setLoadingAnnouncements(false);
      },
      (error) => {
        console.warn('System content error:', error);
        setLoadingAnnouncements(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleUserRole = async (targetUser: UserProfile) => {
    const newRole = targetUser.role === 'admin' ? 'member' : 'admin';
    const confirm = window.confirm(`Change ${targetUser.displayName}'s role to ${newRole.toUpperCase()}?`);
    if (!confirm) return;

    const path = `users/${targetUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { role: newRole });
      if (newRole === 'admin') {
        await setDoc(doc(db, 'admins', targetUser.uid), {
          uid: targetUser.uid,
          email: targetUser.email,
          assignedAt: serverTimestamp(),
        });
      } else {
        await deleteDoc(doc(db, 'admins', targetUser.uid));
      }
    } catch (err) {
      console.error('Role update error:', err);
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleToggleUserStatus = async (targetUser: UserProfile) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const path = `users/${targetUser.uid}`;
    try {
      await updateDoc(doc(db, 'users', targetUser.uid), { status: newStatus });
    } catch (err) {
      console.error('Status update error:', err);
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) return;

    setIsSavingNotice(true);
    const id = `notice_${Date.now()}`;
    const path = `system_content/${id}`;
    const payload: SystemContent = {
      id,
      type: noticeType,
      title: noticeTitle.trim(),
      body: noticeBody.trim(),
      targetModel: noticeTargetModel.trim() || undefined,
      isPublished: noticeIsPublished,
      updatedBy: currentUser?.email || 'admin',
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'system_content', id), payload);
      setNoticeTitle('');
      setNoticeBody('');
      setNoticeTargetModel('');
      setIsAddNoticeOpen(false);
    } catch (err) {
      console.error('Save announcement error:', err);
      handleFirestoreError(err, OperationType.CREATE, path);
    } finally {
      setIsSavingNotice(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const path = `system_content/${id}`;
    try {
      await deleteDoc(doc(db, 'system_content', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  const handleTogglePublish = async (notice: SystemContent) => {
    const path = `system_content/${notice.id}`;
    try {
      await updateDoc(doc(db, 'system_content', notice.id), {
        isPublished: !notice.isPublished,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchesSearch =
      !searchUser.trim() ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.displayName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchUser.toLowerCase());
    return matchesRole && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <div className="brutal-card-lg p-8 sm:p-12 text-center bg-white border-2 border-black max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 bg-[#FF4343] text-white border-2 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
          Administrator Console Restricted
        </h2>
        <p className="text-sm text-neutral-700 font-medium mb-4">
          This portal enforces role-based access control (RBAC). Only users with the <span className="font-mono font-bold bg-[#FF4343] text-white px-1">ADMIN</span> role (such as <span className="font-mono font-bold">adifery80@gmail.com</span>) can view registered accounts and manage system announcements.
        </p>
        <div className="p-4 bg-amber-50 border-2 border-black mb-6 text-left text-xs font-mono">
          <p className="font-bold mb-1">Current User Details:</p>
          <p>Email: {currentUser?.email || 'Not Signed In'}</p>
          <p>Role: {currentUser?.role || 'Guest'}</p>
        </div>
        <button
          onClick={onSimulateAdmin}
          className="brutal-btn px-6 py-3 bg-[#FFE600] text-black font-extrabold uppercase text-xs"
        >
          🛡️ Switch to Admin Account (Demo Mode)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Admin Header */}
      <div className="brutal-card p-6 bg-white border-2 border-black">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#FF4343] text-white px-2 py-0.5 border-2 border-black font-mono text-xs font-black uppercase">
                Admin Console
              </span>
              <span className="font-mono text-xs text-neutral-600 font-bold">
                Logged in as: {currentUser.email}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
              Role-Based Governance & System Content
            </h1>
            <p className="text-sm text-neutral-700 mt-1 font-medium">
              Manage all registered user accounts, toggle permissions, inspect user eval counts, and broadcast portal-wide announcements.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FBF9F1] p-3 border-2 border-black shrink-0">
            <div>
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">Total Users</span>
              <span className="text-xl font-black font-mono tabular-nums">{users.length}</span>
            </div>
            <div className="border-l border-neutral-300 pl-3">
              <span className="text-[10px] font-mono uppercase text-neutral-500 block">Announcements</span>
              <span className="text-xl font-black font-mono tabular-nums">{announcements.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: User Account Directory */}
      <div className="brutal-card p-6 bg-white border-2 border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-black" />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Registered User Accounts ({users.length})
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="flex gap-1">
              {['all', 'admin', 'member'].map((role) => (
                <button
                  key={role}
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-2.5 py-1 text-xs font-bold border-2 border-black cursor-pointer ${
                    userRoleFilter === role ? 'bg-[#FFE600] font-black' : 'bg-white hover:bg-neutral-100'
                  }`}
                >
                  {role.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search email or name..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="brutal-input pl-8 pr-3 py-1 text-xs font-medium w-full"
              />
            </div>
          </div>
        </div>

        {/* User Table */}
        {loadingUsers ? (
          <div className="p-8 text-center font-mono text-xs uppercase animate-pulse">
            Fetching registered accounts from Firestore...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-600 font-mono">
            No matching user accounts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-black bg-[#FBF9F1] font-mono uppercase text-neutral-600">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Evals Logged</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b border-black">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-neutral-50">
                    <td className="py-3 px-3">
                      <div className="font-bold text-black">{u.displayName}</div>
                      <div className="font-mono text-[11px] text-neutral-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border border-black uppercase ${
                        u.role === 'admin' ? 'bg-[#FF4343] text-white' : 'bg-[#00F0FF] text-black'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 border border-black uppercase ${
                        u.status === 'active' ? 'bg-[#70FF00] text-black' : 'bg-neutral-300 text-neutral-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold tabular-nums">
                      {u.evalCount ?? 0}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => handleToggleUserRole(u)}
                          title="Toggle role"
                          className="brutal-btn px-2 py-1 bg-white hover:bg-neutral-100 text-[11px] font-mono"
                        >
                          <ArrowRightLeft className="w-3 h-3 mr-1" />
                          <span>Make {u.role === 'admin' ? 'Member' : 'Admin'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          title="Toggle status"
                          className={`brutal-btn px-2 py-1 text-[11px] font-mono ${
                            u.status === 'active' ? 'bg-amber-100 hover:bg-amber-200' : 'bg-green-100 hover:bg-green-200'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: System Content & Announcements */}
      <div className="brutal-card p-6 bg-white border-2 border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-black" />
            <h2 className="text-xl font-black uppercase tracking-tight">
              Portal Announcements & Featured Spotlights
            </h2>
          </div>

          <button
            onClick={() => setIsAddNoticeOpen(true)}
            className="brutal-btn px-3.5 py-1.5 bg-[#FFE600] text-black text-xs font-black uppercase flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post System Content</span>
          </button>
        </div>

        {loadingAnnouncements ? (
          <div className="p-8 text-center font-mono text-xs uppercase animate-pulse">
            Loading system content from Firestore...
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-600 font-mono">
            No system announcements active. Click "Post System Content" to publish an alert.
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((notice) => (
              <div
                key={notice.id}
                className="p-4 bg-[#FBF9F1] border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] uppercase font-black bg-black text-white px-1.5 py-0.5">
                      {notice.type}
                    </span>
                    <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border border-black ${
                      notice.isPublished ? 'bg-[#70FF00] text-black' : 'bg-neutral-200 text-neutral-600'
                    }`}>
                      {notice.isPublished ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                    {notice.targetModel && (
                      <span className="font-mono text-[10px] text-neutral-600">
                        Model: {notice.targetModel}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-sm text-black">{notice.title}</h3>
                  <p className="text-xs text-neutral-700 mt-0.5">{notice.body}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(notice)}
                    className="brutal-btn px-2.5 py-1 bg-white text-xs font-mono font-bold"
                  >
                    {notice.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(notice.id)}
                    className="brutal-btn p-1.5 bg-[#FF4343] text-white hover:bg-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Creating New Announcement */}
      {isAddNoticeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="brutal-card-lg bg-white w-full max-w-lg p-6 border-3 border-black relative">
            <h2 className="text-lg font-black uppercase tracking-tight mb-4 pb-2 border-b-2 border-black">
              Create System Content
            </h2>
            <form onSubmit={handleSaveAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">Content Type</label>
                <select
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value as any)}
                  className="brutal-input w-full p-2 text-xs font-bold bg-white"
                >
                  <option value="announcement">System Announcement (Broadcast Alert)</option>
                  <option value="featured_model">Featured SOTA Model Spotlight</option>
                  <option value="category_spotlight">Category Benchmark Spotlight</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">Title</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Claude Opus 5 Hits 96% SWE-bench Saturation"
                  className="brutal-input w-full p-2 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">Target Model (Optional)</label>
                <input
                  type="text"
                  value={noticeTargetModel}
                  onChange={(e) => setNoticeTargetModel(e.target.value)}
                  placeholder="e.g. Claude Opus 5"
                  className="brutal-input w-full p-2 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold font-mono uppercase block mb-1">Body Text</label>
                <textarea
                  rows={3}
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  placeholder="Detailed announcement copy..."
                  className="brutal-input w-full p-2 text-xs font-medium"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubCheck"
                  checked={noticeIsPublished}
                  onChange={(e) => setNoticeIsPublished(e.target.checked)}
                  className="w-4 h-4 border-2 border-black"
                />
                <label htmlFor="pubCheck" className="text-xs font-bold font-mono uppercase cursor-pointer">
                  Publish Immediately for All Users
                </label>
              </div>

              <div className="pt-3 border-t-2 border-black flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddNoticeOpen(false)}
                  className="brutal-btn px-4 py-2 bg-white text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingNotice}
                  className="brutal-btn px-5 py-2 bg-[#FFE600] text-black text-xs font-black uppercase"
                >
                  {isSavingNotice ? 'Posting...' : 'Publish Content'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
