import fs from 'fs'
import path from 'path'

const readFile = fs.promises.readFile
const readdir = fs.promises.readdir

export default function GuidePage({ guide }: any) {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{guide.title}</h1>
      <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
        {guide.body}
      </div>
      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          ← Back to Home
        </a>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const guidesDir = path.join(process.cwd(), 'content/guides')
  try {
    const files = await readdir(guidesDir)
    
    return {
      paths: files
        .filter(file => file.endsWith('.md'))
        .map(file => ({
          params: { slug: file.replace('.md', '') }
        })),
      fallback: false
    }
  } catch (error) {
    return {
      paths: [],
      fallback: false
    }
  }
}

export async function getStaticProps({ params }: any) {
  try {
    const filePath = path.join(process.cwd(), 'content/guides', `${params.slug}.md`)
    const content = await readFile(filePath, 'utf-8')
    
    return {
      props: {
        guide: { 
          title: params.slug.replace(/_/g, ' ').charAt(0).toUpperCase() + params.slug.replace(/_/g, ' ').slice(1),
          body: content 
        }
      },
      revalidate: 3600 // ISR: regenerate every hour
    }
  } catch (error) {
    return {
      notFound: true
    }
  }
}
