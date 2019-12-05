import {Column, CreatedAt, DataType, Model, Table, UpdatedAt} from 'sequelize-typescript';

@Table({
    timestamps: true,
    tableName: 'tbl_books_catalog',
})
export default class LibraryCatalogue extends Model<LibraryCatalogue> {
    @Column({
        type: DataType.STRING(200),
        allowNull: true,
    })
    title: string;

    @Column({
        type: DataType.STRING(200),
        allowNull: true,
        field: 'subtitle',
    })
    subTitle: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    authors: String;

    @Column({
        type: DataType.INTEGER(11),
        defaultValue: '1',
        field: 'available_copies',
        allowNull: true,
    })
    availableCopies: number;

    @Column({
        type: DataType.INTEGER(11),
        allowNull: true,
    })
    description: String;

    @Column({
        type: DataType.INTEGER(11),
        allowNull: true,
    })
    pages: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
    })
    print_type: String;

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
        field: 'maturityrating',
    })
    maturityRating: String;

    @Column({
        type: DataType.STRING(200),
        allowNull: true,
    })
    smallThumbnail: String;

    @Column({
        type: DataType.STRING(200),
        allowNull: true,
    })
    thumbnail: String;
    AIzaSyCNIPDBvKEuBK9EooCsJVegQb9rzIIYMT0
    @Column({
        type: DataType.STRING(20),
        allowNull: true,
    })
    language: String;

    @Column({
        type: DataType.INTEGER(4),
        allowNull: true,
        field: 'publishdate',
    })
    publishDate: number;

    @Column({
        type: DataType.INTEGER(11),
        defaultValue: '0',
        field: 'borrowed_copies',
    })
    borrowedCopies: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    categories: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'subcategory',
    })
    subCategory: number;

    @Column({
        type: DataType.STRING(30),
        allowNull: true,
    })
    isbn: number;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        field: 'book_class',
    })
    bookClass: string;

    @Column({
        type: DataType.STRING(11),
        allowNull: true,
        unique: true,
        field: 'access_id',
    })
    accessId: string;

    @CreatedAt
    created_at: Date;

    @UpdatedAt
    updated_at: Date;
}
