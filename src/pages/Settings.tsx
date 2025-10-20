import Flag from 'react-world-flags';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2, Undo2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import NavbarLayout from "@/components/features/navbar";

const Settings = () => {
  const [language, setLanguage] = useState("en");
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    alert("Your account has been deleted.");
    navigate("/");
  };

  return (
    <NavbarLayout>
      <div className="relative flex justify-center items-center flex-1 py-10 px-4">
        <Card className=" w-full max-w-md shadow-md border">
          <Button onClick={() => navigate("/")} variant="outline" className='absolute top-5 left-5'>
            <Undo2 className='w-10 h-10' /> Go Back
          </Button>
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div>
              <Label className="text-sm font-medium">Language Preference</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="en"><Flag code="GB" height="16" width="16" /> English </SelectItem>
                  <SelectItem value="es"><Flag code="ES" height="16" width="16" /> Spanish </SelectItem>
                  <SelectItem value="fr"><Flag code="FR" height="16" width="16" /> French </SelectItem>
                  <SelectItem value="hi"><Flag code="IN" height="16" width="16" /> Hindi </SelectItem>

                </SelectContent>
              </Select>


            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Management</Label>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Your account and all related data will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </NavbarLayout>
  );
};

export default Settings;
