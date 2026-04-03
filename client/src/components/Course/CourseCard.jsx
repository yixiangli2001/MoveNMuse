// Jiayu
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const money = (n) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "AUD",
  }).format(Number(n || 0));

// CourseCard component to display course information
export default function CourseCard({ c }) {
  return (
    <div className="dynamic-card overflow-hidden group">
      {/* Visual Header / Image placeholder would go here if available */}
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {c.category || "General"}
            </span>
            {c.lowCapacity && (
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-red-600">
                Limited
              </span>
            )}
          </div>
          <h3 className="text-2xl font-display font-medium text-neutral-900 group-hover:text-blue-600 transition-colors">
            {c.name}
          </h3>
        </div>

        <p className="text-neutral-500 font-light leading-relaxed line-clamp-3 text-sm">
          {c.description}
        </p>

        <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 uppercase tracking-widest">Investment</span>
            <span className="text-lg font-medium text-neutral-900">{money(c.price)}</span>
          </div>
          
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors"
            to={`/courses/${c.courseId}`}
          >
            <span>Details</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
        
        {c.nextStartTime && (
          <div className="text-[10px] text-neutral-400 italic">
            Next session: {new Date(c.nextStartTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

CourseCard.propTypes = {
  c: PropTypes.shape({
    courseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
      .isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string,
    level: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    nextStartTime: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.instanceOf(Date),
    ]),
    lowCapacity: PropTypes.bool,
  }).isRequired,
};
