import { Button } from "@/components/ui/button"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import Panel from "./panel"
import { PanelRight } from "lucide-react"
export function SheetPanel() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex md:hidden "><PanelRight /></Button>
      </SheetTrigger>
      <SheetContent className="w-full pt-8">
        <Panel isMobileVersion={true} />
      </SheetContent>
    </Sheet>
  )
}
