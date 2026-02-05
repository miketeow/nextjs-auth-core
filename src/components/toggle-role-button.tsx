"use client";

import { Button } from "@/components/ui/button";
import { toggleRole } from "@/lib/toggle-role";

const ToggleRoleButton = () => {
  return <Button onClick={toggleRole}>Toggle Role</Button>;
};

export default ToggleRoleButton;
