
import { Button } from '@/components/ui/button';

type EmailConfirmationMessageProps = {
  contactValue: string;
  onBack: () => void;
};

const EmailConfirmationMessage = ({ contactValue, onBack }: EmailConfirmationMessageProps) => {
  return (
    <div className="space-y-4 text-center">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          We've sent a confirmation link to <strong>{contactValue}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link in your email to complete your account setup and sign in.
        </p>
      </div>
      <Button
        type="button"
        variant="link"
        className="w-full text-bullion-purple hover:text-bullion-purple-800"
        onClick={onBack}
      >
        Back to Sign Up
      </Button>
    </div>
  );
};

export default EmailConfirmationMessage;
