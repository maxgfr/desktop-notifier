type Props = {
  prevRespData?: string;
  currentRespData?: string;
  threshold?: number;
  iteration?: number;
};

const comparator = ({
  prevRespData,
  currentRespData,
  iteration,
  threshold = 0.03,
}: Props): boolean => {
  if (!prevRespData || !currentRespData || !iteration || iteration === 0) {
    return false;
  }
  const prevLength = prevRespData.length;
  const currentLength = currentRespData.length;
  const diff = Math.abs(prevLength - currentLength);
  if (diff / prevLength > threshold) {
    return true;
  }
  return false;
};

export default comparator;
