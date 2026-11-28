"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Loader2 } from "lucide-react";
import {
  formatINR,
  StatusBadge,
  useAdminToast,
} from "@/components/admin/admin-utils";

export default function CampaignsPage() {
  const { showToast } = useAdminToast();
  const data = useQuery(api.dashboard.listCampaigns);
  const access = useQuery(api.admin.getMyAdminAccess);
  const upsert = useMutation(api.dashboard.upsertCampaign);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const canWrite = access?.role === "owner" || access?.role === "admin";

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsert({
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
        isActive: true,
        sortOrder: (data?.campaigns.length ?? 0) + 1,
      });
      showToast("Campaign / purpose saved", "success");
      setTitle("");
      setSlug("");
      setDescription("");
      setTargetAmount("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Purpose Totals from Actual Donations */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
          Live Totals by Recorded Donation Purpose
        </h3>
        {data === undefined ? (
          <div className="p-6 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#012A5F]" />
          </div>
        ) : data.purposeTotals.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No donations found yet.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.purposeTotals.map((item) => (
              <div
                key={item.purpose}
                className="rounded-xl border border-gray-200 bg-gray-50/70 p-4"
              >
                <p className="text-xs font-bold text-[#012A5F]">{item.purpose}</p>
                <p className="mt-1.5 text-xl font-bold text-[#12715B]">
                  {formatINR(item.raised)}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {item.count} successful donation(s)
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configured Campaigns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#012A5F] pb-3 border-b border-gray-100">
            Configured Campaigns
          </h3>
          {data === undefined ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-[#012A5F]" />
            </div>
          ) : data.campaigns.length === 0 ? (
            <p className="py-8 text-xs text-gray-500">
              No custom campaigns configured yet.
            </p>
          ) : (
            <div className="mt-3 divide-y divide-gray-100">
              {data.campaigns.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between py-3 gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#012A5F]">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-500">{c.description}</p>
                    {c.targetAmount && (
                      <p className="text-[11px] text-[#12715B] font-semibold mt-0.5">
                        Target: {formatINR(c.targetAmount)}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={c.isActive ? "active" : "cancelled"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {canWrite && (
          <form
            onSubmit={handleAdd}
            className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-xs space-y-3 h-fit"
          >
            <h3 className="text-sm font-bold text-[#012A5F]">
              Add Campaign / Purpose
            </h3>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Education Support"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief purpose description"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Target Amount (INR, optional)
              </label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="100000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#012A5F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#012048] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              {saving ? "Saving..." : "Save Campaign"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
