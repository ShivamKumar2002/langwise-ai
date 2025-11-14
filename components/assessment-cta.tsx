'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function AssessmentCTA() {
  const router = useRouter();

  return (
    <Card className="p-8 bg-linear-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">
            Ready for another assessment?
          </h3>
          <p className="text-blue-100">
            Take a 5-minute practice session with Sora to track your progress
          </p>
        </div>
        <Button
          onClick={() => router.push("/assessment")}
          className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 whitespace-nowrap"
        >
          Practice Now - 5 min
        </Button>
      </div>
    </Card>
  );
}
