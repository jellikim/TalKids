import * as S from './style';

function InputBox({ props: { id, desc, color, placeholder, type, value, callback } }) {
    
    return (
        <S.FieldSet color={color} isFill={!!value}>
            <legend>{desc} Insert Field</legend>
            <label htmlFor={id}>{placeholder}</label>
            <S.TextBox type={type} id={id} name={id} color={color} value={value} onChange={callback} isFill={!!value}/>
        </S.FieldSet>
    )
    }
    


export default InputBox
