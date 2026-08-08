export class ReservationDTO {
    constructor(reservation){
        this.id = reservation._id || reservation.id 
        this.event = reservation.event
        this.user = reservation.user
        this.status = reservation.status 
        this.quantity = reservation.quantity
        this.reservationCode = reservation.reservationCode
        this.createdAt = reservation.createdAt
        this.cancelledAt = reservation.cancelledAt
    }
}