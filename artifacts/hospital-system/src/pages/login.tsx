import { useAuthStore } from "@/lib/auth";
import { useListAuthUsers, useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { data: users, isLoading } = useListAuthUsers();
  const loginMutation = useLogin();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { toast } = useToast();

  const handleLogin = async (username: string) => {
    try {
      const result = await loginMutation.mutateAsync({
        data: { username, password: "demo" },
      });
      setAuth(result.token, result.user);
      toast({
        title: "بەخێربێیت",
        description: `چوویته‌ ژووره‌وه‌ وه‌ک ${result.user.fullName}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "هەڵە",
        description: "نەتوانرا بچیتە ژوورەوە",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">سیستەمی بەڕێوەبردنی نەخۆشخانە</CardTitle>
          <CardDescription>تکایە هەژمارێک هەڵبژێرە بۆ چوونەژوورەوە (تێپەڕەوشە ئامادەکراوە)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {users?.map((user) => (
                <Button
                  key={user.username}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4 border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                  onClick={() => handleLogin(user.username)}
                  disabled={loginMutation.isPending}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold text-foreground">{user.fullName}</span>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{user.username}</span>
                      <span>•</span>
                      <span>{({admin:"بەڕێوەبەری گشتی",manager:"بەڕێوەبەر",doctor:"پزیشک",nurse:"پەرستار",pharmacist:"دەرمانفرۆش",cashier:"سندوقدار",labtech:"تەکنیسیەنی تاقیگە",radtech:"تەکنیسیەنی تیشک"} as Record<string,string>)[user.role] ?? user.role}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
