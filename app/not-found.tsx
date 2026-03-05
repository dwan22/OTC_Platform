import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-orange-600" />
            <CardTitle>Page Not Found</CardTitle>
          </div>
          <CardDescription>
            The page you&apos;re looking for doesn&apos;t exist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
