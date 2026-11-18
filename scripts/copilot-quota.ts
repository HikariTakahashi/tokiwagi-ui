type Review = {
  user?: { id?: number; login?: string; type?: string };
  state?: string;
  submitted_at?: string;
  commit_id?: string;
  body?: string;
};

// GitHubの提出済みレビューだけを根拠にし、本文を転載した利用者の投稿は受理しない。
export function copilotQuotaExceeded(reviews: readonly Review[], now = new Date()) {
  return reviews.some(review => {
    if (review.user?.type !== 'Bot' || review.user.id !== 175728472 ||
      review.user.login !== 'copilot-pull-request-reviewer[bot]' || review.state !== 'COMMENTED' ||
      !review.submitted_at || !review.commit_id || !/^[0-9a-f]{40}$/.test(review.commit_id)) return false;
    const submitted = new Date(review.submitted_at);
    // 利用枠が更新される翌月に、古い上限通知を理由として依頼を省略しない。
    if (!Number.isFinite(submitted.getTime()) || submitted > now ||
      submitted.getUTCFullYear() !== now.getUTCFullYear() || submitted.getUTCMonth() !== now.getUTCMonth()) return false;
    return /^Copilot was unable to review this pull request because the user who requested the review has insufficient remaining quota\.(?:\s+Try requesting a review at a lower effort level\.)?$/.test(review.body?.trim() ?? '');
  });
}
