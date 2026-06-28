'use client'

import { Play, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'

export function Portfolio() {
  return (
    <section id="portfolio" className="relative py-32 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Featured Story
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">From Palm to Premium</span>
          </h2>
          
          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Step inside our Saudi kilns and follow a single date palm log on its journey to becoming the world's finest charcoal.
          </p>
        </div>

        {/* Featured Video */}
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-card clean-border rounded-3xl overflow-hidden elevated-shadow">
            {/* Video Embed */}
            <div className="relative">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/fIbDWDh6aYw?rel=0&showinfo=0&modestbranding=1"
                  title="Palm Charcoal — From Palm to Premium"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full rounded-t-3xl"
                />
              </div>
              
              {/* Floating Status Badge */}
              <div className="absolute top-6 right-6">
                <span className="glass-effect rounded-xl px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                  Signature Film
                </span>
              </div>
            </div>

            {/* Project Details */}
            <div className="p-8 lg:p-12">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-accent-purple/10 text-accent-purple px-3 py-1 rounded-full text-sm font-medium">
                    Origin Story
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Region: Al-Ahsa, Saudi Arabia
                  </span>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  The Heart of the Palm
                </h3>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  An intimate look at the master craftsmen, traditional kilns, and modern quality controls behind فحم النخلة. From sustainable palm pruning to vacuum-sealed export cartons, every step is engineered for a clean, long-burning ember worthy of luxury hospitality.
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Material</span>
                    <span className="font-medium">Date Palm Wood</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Heat Output</span>
                    <span className="font-medium">+7,500 kcal/kg</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Burn Time</span>
                    <span className="font-medium">3+ Hours</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Origin</span>
                    <span className="font-medium">Saudi Arabia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
