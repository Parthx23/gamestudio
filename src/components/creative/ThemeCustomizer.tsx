import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Palette, Sparkles, Moon, Sun, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { name: 'Cosmic', primary: '#6366f1', secondary: '#8b5cf6', bg: '#0f0f23' },
  { name: 'Neon', primary: '#00ffff', secondary: '#ff00ff', bg: '#000011' },
  { name: 'Forest', primary: '#22c55e', secondary: '#16a34a', bg: '#0f1419' },
  { name: 'Sunset', primary: '#f59e0b', secondary: '#ef4444', bg: '#1a0f0a' },
  { name: 'Ocean', primary: '#0ea5e9', secondary: '#06b6d4', bg: '#0c1420' },
  { name: 'Purple', primary: '#a855f7', secondary: '#c084fc', bg: '#1a0b2e' }
];

const effects = [
  { name: 'Particles', icon: Sparkles, enabled: true },
  { name: 'Glow', icon: Zap, enabled: false },
  { name: 'Dark Mode', icon: Moon, enabled: true },
  { name: 'Light Mode', icon: Sun, enabled: false }
];

export const ThemeCustomizer = () => {
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [activeEffects, setActiveEffects] = useState(effects);

  const applyTheme = (theme: typeof themes[0]) => {
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--secondary', theme.secondary);
    document.documentElement.style.setProperty('--background', theme.bg);
    setSelectedTheme(theme);
  };

  const toggleEffect = (effectName: string) => {
    setActiveEffects(prev => 
      prev.map(effect => 
        effect.name === effectName 
          ? { ...effect, enabled: !effect.enabled }
          : effect
      )
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="fixed bottom-4 right-4 z-50">
          <Palette className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customizer
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <h3 className="font-semibold mb-3">Color Themes</h3>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => applyTheme(theme)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    selectedTheme.name === theme.name 
                      ? "border-primary" 
                      : "border-transparent hover:border-muted-foreground"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                  }}
                >
                  <div className="text-xs font-medium text-white">
                    {theme.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual Effects */}
          <div>
            <h3 className="font-semibold mb-3">Visual Effects</h3>
            <div className="space-y-2">
              {activeEffects.map((effect) => (
                <div key={effect.name} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <div className="flex items-center gap-2">
                    <effect.icon className="h-4 w-4" />
                    <span className="text-sm">{effect.name}</span>
                  </div>
                  <Button
                    variant={effect.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleEffect(effect.name)}
                  >
                    {effect.enabled ? 'On' : 'Off'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg border border-border">
            <h4 className="font-medium mb-2">Preview</h4>
            <div 
              className="h-20 rounded bg-gradient-to-r flex items-center justify-center text-white font-bold"
              style={{
                background: `linear-gradient(135deg, ${selectedTheme.primary}, ${selectedTheme.secondary})`
              }}
            >
              GameStudio
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};