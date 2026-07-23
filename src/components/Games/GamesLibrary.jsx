import { ChevronRight } from "lucide-react";
import PageChalkBanner from "../shared/PageChalkBanner";
import { CLASSROOM_GAMES } from "../../data/classroomGames";

function GameCard({ game, onClick }) {
  return (
    <button
      type="button"
      className="game-card"
      data-tour={game.id === "money-moves" ? "games-money-moves" : undefined}
      onClick={onClick}
    >
      <div className="game-card-icon" aria-hidden="true">
        {game.icon}
      </div>
      <h3>{game.name}</h3>
      <p>{game.description}</p>
      <div className="game-card-cta">
        Play <ChevronRight size={16} aria-hidden="true" />
      </div>
    </button>
  );
}

function ComingSoonGameCard() {
  return (
    <div className="game-card coming-soon">
      <div className="game-card-icon muted" aria-hidden="true">
        🎲
      </div>
      <h3>More games</h3>
      <p>New classroom games are on the way.</p>
      <div className="game-card-cta muted">Coming soon</div>
    </div>
  );
}

/**
 * Games library — chalk header + card grid (Lessons-style).
 */
export default function GamesLibrary({ onSelectGame }) {
  return (
    <section className="game-page-main games-library">
      <PageChalkBanner
        eyebrow="Classroom Games"
        title="Choose a Game to Start"
        subtitle="Pick a classroom game, then set up teams and open the board."
      />
      <div className="games-library-body">
        <div className="game-grid" data-tour="games-grid">
          {CLASSROOM_GAMES.map(game => (
            <GameCard key={game.id} game={game} onClick={() => onSelectGame?.(game.id)} />
          ))}
          <ComingSoonGameCard />
        </div>
      </div>
    </section>
  );
}
