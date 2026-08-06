"use client";

import {
    LoaderCircle,
    CheckCircle2,
    AlertTriangle,
    Database,
    ServerCog
} from "lucide-react";

import {
    BootStage,
    BootState
} from "../BootStage";

import { GlassCard } from "@/components/ui/GlassCard";
import { GlassIcon } from "@/components/ui/GlassIcon";

interface Props{
    state: BootState;
}

export function BootSplash({
    state
}:Props){

    return(

        <div
            className="
                fixed
                inset-0

                flex
                items-center
                justify-center

                bg-black
            "
        >

            <GlassCard
                className="
                    w-full
                    max-w-xl

                    p-8

                    space-y-8
                "
            >

                <Header/>

                <Progress
                    progress={state.progress}
                />

                <CurrentTask
                    state={state}
                />

                <Footer
                    state={state}
                />

            </GlassCard>

        </div>

    );

}

function Header(){

    return(

        <div
            className="
                flex
                flex-col
                items-center
                gap-4
            "
        >

            <GlassIcon
                size="lg"
            >

                <ServerCog
                    className="
                        h-8
                        w-8

                        animate-spin
                    "
                />

            </GlassIcon>

            <div
                className="
                    text-center
                "
            >

                <h1
                    className="
                        text-3xl
                        font-bold
                    "
                >
                    BizTru
                </h1>

                <p
                    className="
                        text-sm
                        text-gray-400
                    "
                >
                    Starting Business Operating System
                </p>

            </div>

        </div>

    );

}

interface ProgressProps{

    progress:number;

}

function Progress({

    progress

}:ProgressProps){

    return(

        <div
            className="space-y-2"
        >

            <div
                className="
                    flex
                    justify-between
                    text-sm
                "
            >

                <span>
                    Loading
                </span>

                <span>

                    {Math.round(progress)}%

                </span>

            </div>

            <div
                className="
                    h-3

                    rounded-full

                    overflow-hidden

                    bg-white/5
                "
            >

                <div

                    className="
                        h-full

                        bg-teal-400

                        transition-all

                        duration-500
                    "

                    style={{

                        width:`${progress}%`

                    }}

                />

            </div>

        </div>

    );

}

interface TaskProps{

    state:BootState;

}

function CurrentTask({

    state

}:TaskProps){

    return(

        <div
            className="
                flex
                items-center
                gap-4
            "
        >

            {

                state.stage===BootStage.FAILED

                ?

                <AlertTriangle
                    className="
                        text-red-400
                    "
                />

                :

                state.completed

                ?

                <CheckCircle2
                    className="
                        text-emerald-400
                    "
                />

                :

                <LoaderCircle
                    className="
                        animate-spin
                        text-teal-400
                    "
                />

            }

            <div>

                <div
                    className="
                        font-medium
                    "
                >
                    {state.title}
                </div>

                <div
                    className="
                        text-sm
                        text-gray-400
                    "
                >

                    {

                        state.completedTasks

                    }

                    /

                    {

                        state.totalTasks

                    }

                    {" "}Tasks Completed

                </div>

            </div>

        </div>

    );

}

interface FooterProps{

    state:BootState;

}

function Footer({

    state

}:FooterProps){

    return(

        <div
            className="
                border-t
                border-white/10

                pt-4

                flex
                justify-between

                text-xs
                text-gray-500
            "
        >

            <span>

                Local First

            </span>

            <span>

                BizTru OS

            </span>

        </div>

    );

}