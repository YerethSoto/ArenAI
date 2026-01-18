import React from "react";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { arrowForward } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./BattleResultModal.css";
import { getAvatarPath } from "../utils/avatarUtils";

interface BattleResultModalProps {
  isOpen: boolean;
  winnerId: string | null;
  myId: string | null;
  players: Record<string, any>;
  battleStats: {
    winRate: number;
    streak: number;
  };
  xpGained: number;
}

const BattleResultModal: React.FC<BattleResultModalProps> = ({
  isOpen,
  winnerId,
  myId,
  players,
  battleStats,
  xpGained
}) => {
  const history = useHistory();

  // Helper to get opponent ID
  const opponentId = Object.keys(players).find(id => id !== myId);
  const opponent = opponentId ? players[opponentId] : null;
  const me = myId ? players[myId] : null;

  return (
    <IonModal
      isOpen={isOpen}
      className="battle-result-modal"
      backdropDismiss={false}
    >
      <div className="new-result-container">
        {/* Player Matchup Header */}
        <div className="matchup-header">
          {/* Opponent Side */}
          <div className="player-side left">
            <span className="player-name-left">
              {opponent ? opponent.name : "Opponent"}
            </span>
            <img
              src={getAvatarPath(opponent?.avatar || "capybara")}
              alt="Opponent"
              className="player-avatar"
            />
          </div>

          <span className="vs-icon">⚔️</span>

          {/* Player Side */}
          <div className="player-side right">
            <span className="player-name-right">
              {me ? me.name : "You"}
            </span>
            <img
              src={getAvatarPath(me?.avatar || "capybara")}
              alt="Player"
              className="player-avatar"
            />
          </div>
        </div>

        {/* Colored Win/Loss Message */}
        <div
          className={`battle-outcome ${winnerId === myId ? "win" : winnerId === "draw" ? "tie" : "loss"
            }`}
        >
          {winnerId === myId
            ? "You Won!"
            : winnerId === "draw"
              ? "Draw"
              : "You Lost"}
        </div>

        {/* Motivational Quote */}
        <p className="motivational-text">
          {winnerId === myId
            ? '"Victory belongs to those who believe in it the most and believe in it the longest."'
            : winnerId === "draw"
              ? '"A worthy battle! Sometimes the best victories are the lessons learned."'
              : '"Failure is the opportunity to begin again more intelligently. Keep pushing forward!"'}
        </p>

        <div className="stats-cards">
          <div className="stat-box">
            <div className="stat-title">Win Rate</div>
            <div className="stat-number">{battleStats.winRate}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-title">Streak</div>
            <div className="stat-number">{battleStats.streak}</div>
          </div>
          <div className="stat-box">
            <div className="stat-title">XP</div>
            <div className="stat-number" style={{ color: '#FFD700' }}>+{xpGained}</div>
          </div>
        </div>

        {/* Action Button */}
        <IonButton
          expand="block"
          className="lobby-return-btn"
          onClick={() => history.replace("/page/battle-lobby")}
        >
          Back to Lobby <IonIcon icon={arrowForward} slot="end" />
        </IonButton>
      </div>
    </IonModal>
  );
};

export default BattleResultModal;
