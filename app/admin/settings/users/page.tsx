"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { UserPlus, Loader2, Shield } from "lucide-react";
import {
  formatIstDateTime,
  StatusBadge,
  useAdminToast,
} from "@/components/admin/admin-utils";

export default function AdminUsersPage() {
  const { showToast } = useAdminToast();
  const access = useQuery(api.admin.getMyAdminAccess);
  const users = useQuery(api.admin.listAdminUsers);

  const addAdmin = useMutation(api.admin.addAdminUser);
  const updateRole = useMutation(api.admin.updateAdminRole);
  const toggleActive = useMutation(api.admin.toggleAdminActive);

  const [clerkUserId, setClerkUserId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"admin" | "viewer">("viewer");
  const [submitting, setSubmitting] = useState(false);

  const isOwner = access?.role === "owner";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addAdmin({ clerkUserId, email, fullName, role });
      showToast(`Administrator added for ${email}`, "success");
      setClerkUserId("");
      setEmail("");
      setFullName("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (
    adminId: Id<"adminUsers">,
    newRole: "admin" | "viewer",
  ) => {
    try {
      await updateRole({ adminId, role: newRole });
      showToast("Role updated", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Update failed", "error");
    }
  };

  const handleToggleActive = async (
    adminId: Id<"adminUsers">,
    isActive: boolean,
  ) => {
    try {
      await toggleActive({ adminId, isActive });
      showToast(
        isActive ? "Administrator activated" : "Administrator deactivated",
        "success",
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Action failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#012A5F]">
                Registered Administrators
              </h3>
              <p className="text-xs text-gray-500">
                Verified against Clerk User ID and issuer on every backend request.
              </p>
            </div>
            <Shield className="h-5 w-5 text-[#12715B]" />
          </div>

          <div className="overflow-x-auto">
            {users === undefined ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#012A5F]" />
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[11px] font-semibold uppercase text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Name / Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Added</th>
                    {isOwner && <th className="px-4 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#012A5F]">{u.fullName}</p>
                        <p className="text-[11px] text-gray-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {isOwner && u.role !== "owner" ? (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(
                                u._id,
                                e.target.value as "admin" | "viewer",
                              )
                            }
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold uppercase"
                          >
                            <option value="admin">ADMIN</option>
                            <option value="viewer">VIEWER</option>
                          </select>
                        ) : (
                          <span className="font-bold uppercase text-[#012A5F]">
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={u.isActive ? "active" : "cancelled"} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatIstDateTime(u.createdAt)}
                      </td>
                      {isOwner && (
                        <td className="px-4 py-3 text-right">
                          {u.role !== "owner" ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleActive(u._id, !u.isActive)
                              }
                              className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                            >
                              {u.isActive ? "Deactivate" : "Activate"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-400">
                              Protected Owner
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Add Admin Form (Owner Only) */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs h-fit">
          <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
            Add Administrator
          </h3>
          {!isOwner ? (
            <p className="mt-4 text-xs text-gray-500">
              Only the Foundation Owner can invite or modify administrator roles.
            </p>
          ) : (
            <form onSubmit={handleAdd} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Clerk User ID
                </label>
                <input
                  required
                  value={clerkUserId}
                  onChange={(e) => setClerkUserId(e.target.value)}
                  placeholder="user_2..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Coordinator Name"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@unihopefoundation.org"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "viewer")}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="admin">ADMIN (Manage donations &amp; receipts)</option>
                  <option value="viewer">VIEWER (Read-only)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#012A5F] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#012048] cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                {submitting ? "Adding..." : "Add Admin User"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
