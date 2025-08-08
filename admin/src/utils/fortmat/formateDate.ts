import dayjs from 'dayjs';

interface formatDateProps {
  date: string | Date;
}

export const formatDate = ({ date }: formatDateProps) => {
  return dayjs(date).format('MMM D, YYYY');
};
