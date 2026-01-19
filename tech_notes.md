Критично важливі реалізаційні нотатки (щоб MVP не “ламався”)
4.1 Atomic booking (гарантія capacity)

Ключова операція в bookingService має бути така:

Перевірити, що дитина належить parent’у (security).

Атомарно інкрементнути takenSeats:

findOneAndUpdate({ _id: classId, status:"SCHEDULED", takenSeats: { $lt: capacity }, startAt: { $gte: now } }, { $inc: { takenSeats: 1 } })

Якщо апдейт не повернув документ → місць немає/заняття недоступне.

Upsert booking:

створити booking або переключити status назад у BOOKED

якщо вже BOOKED → помилка “Already booked”

Якщо booking не вдалося зберегти (unique collision) → відкотити takenSeats - 1.

Це робиться або транзакцією, або “manual rollback” як вище (для MVP норм).

4.2 Перевірка перетинів часу (HallBlock / ClassSession)

Запит на перетин:

Є перетин якщо: existing.startAt < newEnd && existing.endAt > newStart

Mongoose query:

{
  hallId,
  startAt: { $lt: newEnd },
  endAt: { $gt: newStart }
}
