import React from "react";
import { IonButton, IonIcon, IonModal } from "@ionic/react";
import { arrowForward } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./BattleResultModal.css";

interface BattleResultModalProps {
  isOpen: boolean;
  winnerId: string | null;
  myId: string | null;
  players: Record<string, any>;
  battleStats: {
    winRate: number;
    streak: number;
  };
}

const BattleResultModal: React.FC<BattleResultModalProps> = ({
  isOpen,
  winnerId,
  myId,
  players,
  battleStats,
}) => {
  const history = useHistory();

  return (
    <IonModal
      isOpen={isOpen}
      className="battle-result-modal"
      backdropDismiss={false}
    >
      <div className="new-result-container">
        {/* Player Matchup Header */}
        <div className="matchup-header">
          <span className="player-name-left">
            {Object.values(players).find((p) => p.userId !== myId)?.name ||
              "Opponent"}
          </span>
          <span className="vs-icon">⚔️</span>
          <span className="player-name-right">
            {myId && players[myId] ? players[myId].name : "You"}
          </span>
        </div>

        {/* Colored Win/Loss Message */}
        <div
          className={`battle-outcome ${
            winnerId === myId ? "win" : winnerId === "draw" ? "tie" : "loss"
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

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-box">
            <div className="stat-title">Win Rate</div>
            <div className="stat-number">{battleStats.winRate}%</div>
          </div>
          <div className="stat-box">
            <div className="stat-title">Streak</div>
            <div className="stat-number">{battleStats.streak}</div>
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
