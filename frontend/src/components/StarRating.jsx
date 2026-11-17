function StarRating({ rating = 0, onRate, readonly = false }) {
  return (
    <div
      className="flex gap-0.5"
      role="group"
      aria-label={readonly ? `Valoración: ${rating} de 5` : 'Valorar de 1 a 5 estrellas'}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate && onRate(star)}
          aria-label={`${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
          title={`Valorar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
          className={`text-xl transition-transform ${
            star <= rating ? 'text-orange-400' : 'text-slate-300'
          } ${!readonly ? 'cursor-pointer hover:scale-110 hover:text-orange-400' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;