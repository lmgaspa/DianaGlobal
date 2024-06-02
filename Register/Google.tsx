import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

interface DecodedUser {
  name: string;
  picture: string;
  [key: string]: any; // Adicional para quaisquer outros campos presentes no token decodificado
}

const MyGoogleLogin: React.FC = () => {
  const [user, setUser] = useState<DecodedUser | null>(null);
  const router = useRouter();

  const handleLoginSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      console.log("Encoded JWT ID token " + credentialResponse.credential);
      const decodedUser = jwtDecode<DecodedUser>(credentialResponse.credential);
      console.log("User Object:", decodedUser);
      setUser(decodedUser);
      router.push({
        pathname: '/protected/dashboard',
        query: { name: decodedUser.name, picture: decodedUser.picture },
      });
    } else {
      console.error('No credential provided');
    }
  };

  return (
    <GoogleOAuthProvider clientId="206143925112-s9ri4ged3ku0ajretiefq38toqh381rq.apps.googleusercontent.com">
      <div className="flex justify-center"> {/* Adicionando a classe 'flex justify-center' para centralizar o conteúdo */}
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default MyGoogleLogin;

