import { getOccurrenceScores } from '../services/occurrences';

export default function(app, socket) {
  socket.on('fetch-scores', async (userId, { senders }) => {
    const scores = await getOccurrenceScores({ senders });
    socket.emit(userId, 'scores', scores);
  });
}
