import { useSearch } from '../context/SearchContext'

function CarrieLogo() {

    const { showImg } = useSearch()

    return (<>
        {showImg && <><img
            className="Carrie-main-logo"
            style={{ width: "380px" }}
            // style={{ width: "380px", marginLeft: "-32px" }}
            src="/assets/images/pete.png"
            alt="Carrie"
        />
            <br />
            <br />
        </>
        }
    </>
    )
}

export default CarrieLogo