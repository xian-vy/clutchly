export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card w-[350px]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
          <p className="text-muted">
            We have sent you an email with a verification link. Please check your inbox and click the link to verify your account.
          </p>
        </div>
        <p className="text-sm text-muted">
          If you don&apos;t see the email, please check your spam folder.
        </p>
      </div>
    </div>
  )
} 