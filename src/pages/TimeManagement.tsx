import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CalendarDays, ListTodo, Target } from "lucide-react";
import PomodoroTimer from "@/components/time/PomodoroTimer";
import TaskList from "@/components/time/TaskList";
import WeeklyView from "@/components/time/WeeklyView";
import GoalsList from "@/components/time/GoalsList";

export default function TimeManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">تنظيم الوقت</h1>
        <p className="text-muted-foreground text-sm">نظّم مهامك وأهدافك وتابع تقدمك</p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full max-w-lg grid grid-cols-4">
          <TabsTrigger value="tasks" className="gap-1.5 text-xs sm:text-sm">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">المهام</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-1.5 text-xs sm:text-sm">
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">الأسبوع</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="gap-1.5 text-xs sm:text-sm">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">الأهداف</span>
          </TabsTrigger>
          <TabsTrigger value="pomodoro" className="gap-1.5 text-xs sm:text-sm">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">بومودورو</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-5">
          <TaskList />
        </TabsContent>
        <TabsContent value="weekly" className="mt-5">
          <WeeklyView />
        </TabsContent>
        <TabsContent value="goals" className="mt-5">
          <GoalsList />
        </TabsContent>
        <TabsContent value="pomodoro" className="mt-5">
          <PomodoroTimer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
