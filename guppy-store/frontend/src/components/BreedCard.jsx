import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function BreedCard({ breed }) {
  const slug     = breed.slug  || breed._id;
  const name     = breed.name;
  const tagline  = breed.tagline || (breed.count ? `${breed.count} available` : 'Explore breed');
  const gradient = breed.gradient || 'from-blush to-blush-dark';
  const image    = breed.image;

  return (
    <Link to={`/breed/${slug}`}
      className="group relative rounded-2xl overflow-hidden border border-ink-border hover:border-blush/50 shadow-lg hover:shadow-blush/10 transition-all duration-300 hover:-translate-y-1 bg-ink-light">

      {/* Visual area */}
      <div className={`relative h-44 overflow-hidden ${!image ? `bg-gradient-to-br ${gradient}` : ''}`}>
        {image ? (
          <img
            src={image}
            alt={`${name} — a beautiful guppy fish breed`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-90">
            <img
              src="/fish.svg"
              alt={`Placeholder for ${name} — add a real guppy photo in admin panel`}
              className="w-14 h-14 opacity-60 drop-shadow-lg"
            />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Name over image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <h3 className="font-bold text-white text-sm md:text-base drop-shadow leading-tight">{name}</h3>
          <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{tagline}</p>
        </div>

        {/* Arrow */}
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:bg-blush/70">
          <ArrowRight size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
