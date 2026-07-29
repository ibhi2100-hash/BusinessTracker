import { BootstrapContext } from "@/components/Bootstrap/Bootstrap";
import { useContext } from "react";

export function useApplication(){
    const context = useContext(BootstrapContext);
    
    if(!context){
        throw new Error(
            "Application not Bootstrapped"
        )
    }
    return context
}