import useAuth from '@/lib/hooks/useAuth';
import { useRouter } from 'next/router';
import React from 'react'

const InviteCodePage = () => {
    const user = useAuth();
    const router = useRouter();
    const { inviteCode } = router.query;
    const activeInviteCode = Array.isArray(inviteCode) ? inviteCode[0] : inviteCode;

    // find server and get server data

    // if already joined, redirect to server page

    // create new serverMember

    // update user's server to true

    // redirect to server page

  return (
    <div>InvitePage</div>
  )
}

export default InviteCodePage