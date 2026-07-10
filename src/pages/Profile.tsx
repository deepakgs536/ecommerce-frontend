import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, ShieldCheck, Mail } from 'lucide-react';
import { signOut } from 'aws-amplify/auth';
import { logout } from '@/store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Profile = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      dispatch(logout());
      navigate('/login');
      toast.success('Successfully signed out');
    } catch (error: any) {
      toast.error('Error signing out');
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-12 px-4 min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#FAFAFA]">
      <Card className="w-full max-w-2xl border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden premium-shadow">
        <div className="h-32 bg-slate-900 w-full relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
        <CardHeader className="pt-16 pb-6 px-8">
          <CardTitle className="text-3xl font-black text-slate-900">{user.name || 'Valued Member'}</CardTitle>
          <p className="text-slate-500 font-medium">Manage your personal information</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          <div className="grid gap-6">
            <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mr-4 shrink-0">
                <Mail className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                <p className="font-semibold text-slate-900">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mr-4 shrink-0">
                <ShieldCheck className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Account Role</p>
                <p className="font-semibold text-slate-900 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <Button 
              variant="destructive" 
              size="lg" 
              onClick={handleSignOut}
              className="h-14 px-8 rounded-xl font-bold hover:-translate-y-0.5 transition-transform"
            >
              <LogOut className="mr-2 w-5 h-5" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
